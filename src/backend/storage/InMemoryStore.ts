// Storage: In-memory state management

import { Product } from '../../shared/types/Product';
import { Cart } from '../../shared/types/Cart';
import { Order } from '../../shared/types/Order';

export class InMemoryStore {
  private requests: Map<string, { requestId: string; query: string }> = new Map();
  private products: Map<string, Product[]> = new Map();
  private carts: Map<string, Cart> = new Map();
  private orders: Map<string, Order> = new Map();

  saveRequest(requestId: string, query: string): void {
    this.requests.set(requestId, { requestId, query });
  }

  getRequest(requestId: string): { requestId: string; query: string } | undefined {
    return this.requests.get(requestId);
  }

  saveProducts(requestId: string, products: Product[]): void {
    this.products.set(requestId, products);
  }

  getProducts(requestId: string): Product[] | undefined {
    return this.products.get(requestId);
  }

  saveCart(requestId: string, cart: Cart): void {
    this.carts.set(requestId, cart);
  }

  getCart(requestId: string): Cart | undefined {
    return this.carts.get(requestId);
  }

  saveOrder(requestId: string, order: Order): void {
    this.orders.set(requestId, order);
  }

  getOrder(requestId: string): Order | undefined {
    return this.orders.get(requestId);
  }
}

export const storeInstance = new InMemoryStore();
