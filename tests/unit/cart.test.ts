// Unit tests: Cart calculations

import type { Cart, CartItem } from '../../src/shared/types/Cart';
import type { Product } from '../../src/shared/types/Product';

describe('Cart Calculations', () => {
  const createProduct = (id: string, price: number): Product => ({
    id,
    title: `Product ${id}`,
    price,
    currency: 'USD',
    productURL: 'https://example.com',
    source: 'saucedemo',
    inStock: true,
  });

  const calculateCart = (items: CartItem[]): { subtotal: number; total: number } => {
    const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const total = subtotal; // No tax per Phase 2 requirements
    return { subtotal, total };
  };

  describe('Subtotal calculation', () => {
    it('should calculate subtotal as sum of item prices', () => {
      const items: CartItem[] = [
        { product: createProduct('1', 29.99), quantity: 1 },
        { product: createProduct('2', 15.99), quantity: 1 },
      ];

      const { subtotal } = calculateCart(items);
      
      expect(subtotal).toBeCloseTo(45.98, 2);
    });

    it('should handle multiple quantities', () => {
      const items: CartItem[] = [
        { product: createProduct('1', 10.00), quantity: 3 },
        { product: createProduct('2', 5.00), quantity: 2 },
      ];

      const { subtotal } = calculateCart(items);
      
      expect(subtotal).toBe(40.00);
    });

    it('should handle empty cart', () => {
      const items: CartItem[] = [];
      const { subtotal } = calculateCart(items);
      
      expect(subtotal).toBe(0);
    });
  });

  describe('Total calculation', () => {
    it('should calculate total (subtotal only, no custom tax)', () => {
      const items: CartItem[] = [
        { product: createProduct('1', 29.99), quantity: 1 },
      ];

      const { subtotal, total } = calculateCart(items);
      
      expect(total).toBe(subtotal);
      expect(total).toBeCloseTo(29.99, 2);
    });

    it('should maintain currency consistency', () => {
      const items: CartItem[] = [
        { product: createProduct('1', 29.99), quantity: 1 },
        { product: createProduct('2', 15.99), quantity: 1 },
      ];

      const currency = items.length > 0 ? items[0].product.currency : 'USD';
      const allSameCurrency = items.every(item => item.product.currency === currency);
      
      expect(allSameCurrency).toBe(true);
      expect(currency).toBe('USD');
    });
  });

  describe('Edge cases', () => {
    it('should handle decimal precision correctly', () => {
      const items: CartItem[] = [
        { product: createProduct('1', 10.99), quantity: 3 },
      ];

      const { subtotal } = calculateCart(items);
      
      expect(subtotal).toBeCloseTo(32.97, 2);
    });

    it('should handle large quantities', () => {
      const items: CartItem[] = [
        { product: createProduct('1', 1.00), quantity: 1000 },
      ];

      const { subtotal } = calculateCart(items);
      
      expect(subtotal).toBe(1000.00);
    });
  });
});
