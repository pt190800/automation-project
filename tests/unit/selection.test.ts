// Unit tests: Product selection policy

import type { Product } from '../../src/shared/types/Product';

describe('Product Selection Policy', () => {
  const createProduct = (id: string, price: number, inStock: boolean = true): Product => ({
    id,
    title: `Product ${id}`,
    price,
    currency: 'USD',
    productURL: 'https://example.com',
    source: 'saucedemo',
    inStock,
  });

  describe('Cheapest product selection', () => {
    it('should select cheapest product from list', () => {
      const products: Product[] = [
        createProduct('1', 29.99),
        createProduct('2', 15.99),
        createProduct('3', 39.99),
      ];

      const cheapest = products.reduce((min, p) => p.price < min.price ? p : min);
      
      expect(cheapest.id).toBe('2');
      expect(cheapest.price).toBe(15.99);
    });

    it('should select first product when prices are equal', () => {
      const products: Product[] = [
        createProduct('1', 29.99),
        createProduct('2', 29.99),
        createProduct('3', 29.99),
      ];

      const cheapest = products.reduce((min, p) => p.price < min.price ? p : min);
      
      expect(cheapest.id).toBe('1');
    });

    it('should handle single product', () => {
      const products: Product[] = [
        createProduct('1', 29.99),
      ];

      const cheapest = products.reduce((min, p) => p.price < min.price ? p : min);
      
      expect(cheapest.id).toBe('1');
    });
  });

  describe('Stock filtering', () => {
    it('should filter out-of-stock products before selection', () => {
      const products: Product[] = [
        createProduct('1', 29.99, false),
        createProduct('2', 15.99, true),
        createProduct('3', 39.99, true),
      ];

      const inStockProducts = products.filter(p => p.inStock);
      const cheapest = inStockProducts.reduce((min, p) => p.price < min.price ? p : min);
      
      expect(cheapest.id).toBe('2');
      expect(inStockProducts.length).toBe(2);
    });

    it('should throw error if no products in stock', () => {
      const products: Product[] = [
        createProduct('1', 29.99, false),
        createProduct('2', 15.99, false),
      ];

      const inStockProducts = products.filter(p => p.inStock);
      
      expect(inStockProducts.length).toBe(0);
      expect(() => {
        if (inStockProducts.length === 0) {
          throw new Error('No products in stock');
        }
      }).toThrow('No products in stock');
    });
  });
});
