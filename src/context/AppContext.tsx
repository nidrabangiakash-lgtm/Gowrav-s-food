import React, { createContext, useContext, useReducer, ReactNode, useEffect, useState } from 'react';
import { MenuItem, CartItem, Order } from '@/types/menu';
import { defaultMenuItems } from '@/data/defaultMenu';
import { fetchMenuItems, initializeMenu, placeOrderToFirebase, fetchOrders, updateOrderStatusInFirebase, subscribeToOrders } from '@/lib/firebaseUtils';

interface AppState {
  menuItems: MenuItem[];
  cart: CartItem[];
  orders: Order[];
  isAdmin: boolean;
  showSuccess: boolean;
  lastOrder: Order | null;
}

type Action =
  | { type: 'SET_MENU_ITEMS'; items: MenuItem[] }
  | { type: 'ADD_TO_CART'; item: MenuItem }
  | { type: 'REMOVE_FROM_CART'; itemId: string }
  | { type: 'UPDATE_QUANTITY'; itemId: string; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'PLACE_ORDER'; order: Order }
  | { type: 'UPDATE_ORDER_STATUS'; orderId: string; status: Order['status'] }
  | { type: 'SET_ADMIN'; isAdmin: boolean }
  | { type: 'TOGGLE_ITEM_AVAILABILITY'; itemId: string }
  | { type: 'ADD_MENU_ITEM'; item: MenuItem }
  | { type: 'UPDATE_MENU_ITEM'; item: MenuItem }
  | { type: 'DELETE_MENU_ITEM'; itemId: string }
  | { type: 'SET_SHOW_SUCCESS'; show: boolean }
  | { type: 'SCAN_ORDER_QR'; orderId: string }
  | { type: 'SET_ORDERS'; orders: Order[] };

const initialState: AppState = {
  menuItems: [],
  cart: [],
  orders: [],
  isAdmin: false,
  showSuccess: false,
  lastOrder: null,
};

// Generate a simple hash for QR validation
function generateQRData(orderId: string, name: string, phone: string): string {
  const payload = { orderId, name, phone, ts: Date.now() };
  return btoa(JSON.stringify(payload));
}

// Get the next day's date as ISO string
function getNextDayISO(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_MENU_ITEMS':
      return { ...state, menuItems: action.items };
    case 'ADD_TO_CART': {
      const existing = state.cart.find(c => c.menuItem.id === action.item.id);
      if (existing) {
        return {
          ...state,
          cart: state.cart.map(c =>
            c.menuItem.id === action.item.id ? { ...c, quantity: c.quantity + 1 } : c
          ),
        };
      }
      return { ...state, cart: [...state.cart, { menuItem: action.item, quantity: 1 }] };
    }
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter(c => c.menuItem.id !== action.itemId) };
    case 'UPDATE_QUANTITY': {
      if (action.quantity <= 0) {
        return { ...state, cart: state.cart.filter(c => c.menuItem.id !== action.itemId) };
      }
      return {
        ...state,
        cart: state.cart.map(c =>
          c.menuItem.id === action.itemId ? { ...c, quantity: action.quantity } : c
        ),
      };
    }
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    case 'PLACE_ORDER': {
      placeOrderToFirebase(action.order).catch(console.error);
      // Make sure it doesn't already exist to prevent dupes just in case
      const existing = state.orders.find(o => o.id === action.order.id);
      return {
        ...state,
        orders: existing ? state.orders : [action.order, ...state.orders],
        cart: [],
        showSuccess: true,
        lastOrder: action.order,
      };
    }
    case 'UPDATE_ORDER_STATUS': {
      updateOrderStatusInFirebase(action.orderId, action.status).catch(console.error);
      return {
        ...state,
        orders: state.orders.map(o =>
          o.id === action.orderId ? { ...o, status: action.status } : o
        ),
      };
    }
    case 'SET_ADMIN':
      return { ...state, isAdmin: action.isAdmin };
    case 'TOGGLE_ITEM_AVAILABILITY':
      return {
        ...state,
        menuItems: state.menuItems.map(m =>
          m.id === action.itemId ? { ...m, available: !m.available } : m
        ),
      };
    case 'ADD_MENU_ITEM':
      return { ...state, menuItems: [...state.menuItems, action.item] };
    case 'UPDATE_MENU_ITEM':
      return {
        ...state,
        menuItems: state.menuItems.map(m => (m.id === action.item.id ? action.item : m)),
      };
    case 'DELETE_MENU_ITEM':
      return { ...state, menuItems: state.menuItems.filter(m => m.id !== action.itemId) };
    case 'SET_SHOW_SUCCESS':
      return { ...state, showSuccess: action.show, lastOrder: action.show ? state.lastOrder : null };
    case 'SCAN_ORDER_QR':
      return {
        ...state,
        orders: state.orders.map(o =>
          o.id === action.orderId ? { ...o, qrScanned: true } : o
        ),
      };
    case 'SET_ORDERS': {
      // Merge local orders that haven't synced to Firebase yet with Firebase orders
      const firebaseOrderIds = new Set(action.orders.map(o => o.id));
      const localOnlyOrders = state.orders.filter(o => !firebaseOrderIds.has(o.id));
      const mergedOrders = [...localOnlyOrders, ...action.orders];
      return {
        ...state,
        orders: mergedOrders.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      };
    }
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export { generateQRData, getNextDayISO, getTodayISO };

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> => {
      return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
          setTimeout(() => reject(new Error('Firebase timeout')), ms)
        ),
      ]);
    };

    const loadMenu = async () => {
      try {
        let items = await withTimeout(fetchMenuItems(), 5000);
        if (items.length === 0) {
          try {
            await withTimeout(initializeMenu(defaultMenuItems), 5000);
            items = await withTimeout(fetchMenuItems(), 5000);
          } catch {
            console.warn("Firebase init timed out, using default menu");
            items = defaultMenuItems;
          }
        }
        dispatch({ type: 'SET_MENU_ITEMS', items });

        // Load existing orders from Firebase using real-time listener
        const unsubscribeOrders = subscribeToOrders((orders) => {
          dispatch({ type: 'SET_ORDERS', orders });
        });

      } catch (error) {
        console.error("Failed to load data, using defaults", error);
        dispatch({ type: 'SET_MENU_ITEMS', items: defaultMenuItems });
      } finally {
        setIsLoading(false);
      }
    };

    loadMenu();
    // Component unmount logic isn't strictly necessary since it's the root app provider, but we could return the unsubscribe function.
  }, []);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading menu...</div>;
  }

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
