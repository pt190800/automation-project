// API: Frontend client for backend communication

import type { SearchRequest, PurchaseRequest, PurchaseResult } from '../../../shared/types/Services';
import type { Product } from '../../../shared/types/Product';
import type { Cart } from '../../../shared/types/Cart';
import type { RequestTrace } from '../../../shared/types/Trace';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function searchProducts(request: SearchRequest): Promise<{ requestId: string; status: string; products: Product[] }> {
  const response = await fetch(`${API_BASE}/api/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Search failed');
  }

  return response.json();
}

export async function getProducts(requestId: string): Promise<{ products: Product[] }> {
  const response = await fetch(`${API_BASE}/api/products/${requestId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get products');
  }

  return response.json();
}

export async function addToCart(requestId: string, productId: string): Promise<{ cart: Cart }> {
  throw new Error('Not implemented - Phase 4');
}

export async function checkout(request: PurchaseRequest): Promise<PurchaseResult> {
  const response = await fetch(`${API_BASE}/api/purchase`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Checkout failed');
  }

  return response.json();
}

export async function getStatus(requestId: string): Promise<{ trace: RequestTrace }> {
  const response = await fetch(`${API_BASE}/api/status/${requestId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get status');
  }

  return response.json();
}

export async function getScreenshot(requestId: string): Promise<Blob> {
  const response = await fetch(`${API_BASE}/api/screenshots/${requestId}-checkout.png`);

  if (!response.ok) {
    throw new Error('Failed to load screenshot');
  }

  return response.blob();
}
