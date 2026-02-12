// Shared domain type: Product (normalized from scraping)

export interface Product {
  id: string;              // Unique identifier
  title: string;           // Product name
  price: number;           // Normalized as float
  currency: string;        // e.g., "USD"
  productURL: string;      // Direct link to product page
  source: string;          // e.g., "saucedemo"
  imageURL?: string;       // Optional product image
  inStock: boolean;        // Availability status
}
