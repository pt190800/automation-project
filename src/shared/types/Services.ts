// Shared types: Service DTOs (Request/Response models)

import { Product } from './Product';
import { Cart } from './Cart';
import { Order, ShippingDetails } from './Order';

// Search Service DTOs
export interface SearchRequest {
  query: string;
  filters?: {
    maxPrice?: number;
    sortBy?: 'price-asc' | 'price-desc' | 'name';
  };
}

export interface SearchResult {
  requestId: string;
  products: Product[];
  timestamp: string;
}

// Purchase Service DTOs
export interface PurchaseRequest {
  requestId: string;
  productId: string;
  shippingDetails: ShippingDetails;
}

export interface PurchaseResult {
  order: Order;
  screenshotPath: string;   // Required for grading proof
}
