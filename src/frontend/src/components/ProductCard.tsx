// Component: Product card display

import type { Product } from '../../../shared/types/Product';

interface ProductCardProps {
  product: Product;
  onBuy?: (productId: string) => void;
}

export default function ProductCard({ product, onBuy }: ProductCardProps) {
  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '15px',
      backgroundColor: 'white',
    }}>
      {product.imageURL && (
        <img
          src={product.imageURL}
          alt={product.title}
          style={{
            width: '100%',
            height: '150px',
            objectFit: 'contain',
            marginBottom: '10px',
          }}
        />
      )}
      
      <h3 style={{ fontSize: '16px', marginBottom: '10px', minHeight: '40px' }}>
        {product.title}
      </h3>
      
      <div style={{ marginBottom: '10px' }}>
        <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
          ${product.price.toFixed(2)}
        </span>
        <span style={{ fontSize: '14px', color: '#666', marginLeft: '5px' }}>
          {product.currency}
        </span>
      </div>

      <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
        <div>Source: {product.source}</div>
        <div>ID: {product.id}</div>
        <div>In Stock: {product.inStock ? '✓ Yes' : '✗ No'}</div>
      </div>

      {onBuy && (
        <button
          onClick={() => onBuy(product.id)}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          Buy Now (Phase 4)
        </button>
      )}
    </div>
  );
}
