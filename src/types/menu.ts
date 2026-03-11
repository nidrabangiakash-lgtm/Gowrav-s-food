export interface MenuItem {
  id: string;
  name: string;
  preBookPrice: number;
  livePrice: number;
  category: 'veg' | 'non-veg';
  imageUrl: string;
  available: boolean;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface Order {
  id: string;
  name: string;
  phone: string;
  items: CartItem[];
  total: number;
  utr: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
  timestamp: Date;
  bookingDate: string;   // ISO date string of when the order was placed
  validDate: string;     // ISO date string of the next day (pickup day)
  qrData: string;        // Encoded QR payload (order ID + hash)
  qrScanned: boolean;    // Whether the QR has been scanned by admin
}
