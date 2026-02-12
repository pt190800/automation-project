// Shared domain type: Cart

import { Product } from './Product';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  requestId: string;
  items: CartItem[];
  subtotal: number;        // Sum of item prices
  total: number;           // Final total (no custom tax - only if site provides)
  currency: string;
}
