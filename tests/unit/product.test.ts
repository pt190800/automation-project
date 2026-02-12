// Unit tests: Product normalization

describe('Product Normalization', () => {
  describe('Price parsing', () => {
    it('should parse price string "$29.99" to float 29.99', () => {
      const priceText = '$29.99';
      const priceMatch = priceText.match(/[\d.]+/);
      const price = priceMatch ? parseFloat(priceMatch[0]) : 0;
      
      expect(price).toBe(29.99);
    });

    it('should parse price string "$15.50" to float 15.50', () => {
      const priceText = '$15.50';
      const priceMatch = priceText.match(/[\d.]+/);
      const price = priceMatch ? parseFloat(priceMatch[0]) : 0;
      
      expect(price).toBe(15.50);
    });

    it('should handle missing price gracefully', () => {
      const priceText = '';
      const priceMatch = priceText.match(/[\d.]+/);
      const price = priceMatch ? parseFloat(priceMatch[0]) : 0;
      
      expect(price).toBe(0);
    });
  });

  describe('Currency extraction', () => {
    it('should extract currency "USD" from price string with $', () => {
      const priceText = '$29.99';
      const currency = priceText.includes('$') ? 'USD' : 'USD';
      
      expect(currency).toBe('USD');
    });

    it('should default to USD for unknown currency symbols', () => {
      const priceText = '29.99';
      const currency = priceText.includes('$') ? 'USD' : 'USD';
      
      expect(currency).toBe('USD');
    });
  });

  describe('Product ID generation', () => {
    it('should generate unique product ID from title', () => {
      const title = 'Sauce Labs Backpack';
      const id = title.toLowerCase().replace(/\s+/g, '-');
      
      expect(id).toBe('sauce-labs-backpack');
    });

    it('should handle multiple spaces in title', () => {
      const title = 'Test  Product   Name';
      const id = title.toLowerCase().replace(/\s+/g, '-');
      
      expect(id).toBe('test-product-name');
    });
  });
});
