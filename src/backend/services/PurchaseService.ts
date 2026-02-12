// Service: Purchase business logic

import { Cart } from '../../shared/types/Cart';
import { PurchaseRequest, PurchaseResult } from '../../shared/types/Services';

export interface IPurchaseService {
  addToCart(requestId: string, productId: string): Promise<Cart>;
  executeCheckout(request: PurchaseRequest): Promise<PurchaseResult>;
}

// TODO Phase 4: Implement addToCart and executeCheckout
