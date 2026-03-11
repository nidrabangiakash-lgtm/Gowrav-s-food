import { ref, get, set, update, onValue, child } from 'firebase/database';
import { db } from './firebase';
import { MenuItem, Order } from '@/types/menu';

export const fetchMenuItems = async (): Promise<MenuItem[]> => {
    try {
        const dbRef = ref(db);
        const snapshot = await get(child(dbRef, 'menu'));
        const items: MenuItem[] = [];
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                items.push({ id: childSnapshot.key, ...childSnapshot.val() } as MenuItem);
            });
        }
        return items;
    } catch (error) {
        console.error("Error fetching menu items:", error);
        return [];
    }
};

export const fetchOrders = async (): Promise<Order[]> => {
    try {
        const dbRef = ref(db);
        const snapshot = await get(child(dbRef, 'orders'));
        const orders: Order[] = [];
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const data = childSnapshot.val();
                orders.push({
                    ...data,
                    items: data.items || [],
                    timestamp: new Date(data.timestamp),
                } as Order);
            });
        }
        return orders.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
        console.error("Error fetching orders:", error);
        return [];
    }
};

export const subscribeToOrders = (callback: (orders: Order[]) => void) => {
    const ordersRef = ref(db, 'orders');
    return onValue(ordersRef, (snapshot) => {
        const orders: Order[] = [];
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const data = childSnapshot.val();
                orders.push({
                    ...data,
                    items: data.items || [],
                    timestamp: new Date(data.timestamp),
                } as Order);
            });
        }
        callback(orders.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
    }, (error) => {
        console.error("Error subscribing to orders:", error);
    });
};

export const placeOrderToFirebase = async (order: Order): Promise<void> => {
    try {
        const orderData = {
            ...order,
            timestamp: order.timestamp.toISOString(),
        };
        await set(ref(db, `orders/${order.id}`), orderData);
    } catch (error) {
        console.error("Error placing order:", error);
        throw error;
    }
};

export const fetchOrderById = async (orderId: string): Promise<Order | null> => {
    try {
        const dbRef = ref(db);
        const snapshot = await get(child(dbRef, `orders/${orderId}`));
        if (snapshot.exists()) {
            const data = snapshot.val();
            return {
                ...data,
                items: data.items || [],
                timestamp: new Date(data.timestamp),
            } as Order;
        }
        return null;
    } catch (error) {
        console.error("Error fetching order:", error);
        return null;
    }
};

export const markOrderScanned = async (orderId: string): Promise<void> => {
    try {
        await update(ref(db, `orders/${orderId}`), { qrScanned: true });
    } catch (error) {
        console.error("Error marking order as scanned:", error);
        throw error;
    }
};

export const updateOrderStatusInFirebase = async (orderId: string, status: Order['status']): Promise<void> => {
    try {
        await update(ref(db, `orders/${orderId}`), { status });
    } catch (error) {
        console.error("Error updating order status:", error);
        throw error;
    }
};

export const addOrUpdateMenuItemInFirebase = async (item: MenuItem): Promise<void> => {
    try {
        await set(ref(db, `menu/${item.id}`), item);
    } catch (error) {
        console.error("Error saving menu item:", error);
        throw error;
    }
};

export const deleteMenuItemFromFirebase = async (itemId: string): Promise<void> => {
    try {
        await set(ref(db, `menu/${itemId}`), null);
    } catch (error) {
        console.error("Error deleting menu item:", error);
        throw error;
    }
};

export const initializeMenu = async (defaultItems: MenuItem[]): Promise<void> => {
    try {
        const existingItems = await fetchMenuItems();
        if (existingItems.length === 0) {
            console.log("Initializing menu in Firebase...");
            for (const item of defaultItems) {
                await set(ref(db, `menu/${item.id}`), item);
            }
            console.log("Menu initialized.");
        }
    } catch (error) {
        console.error("Error initializing menu items:", error);
    }
};
