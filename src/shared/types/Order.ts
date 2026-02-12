// Shared domain type: Order

import { Cart } from './Cart';

export interface ShippingDetails {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export interface Order {
  requestId: string;
  cart: Cart;
  shippingDetails: ShippingDetails;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
  screenshotPath?: string;  // Required for grading proof
  error?: string;
}
