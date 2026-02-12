// UI: Results page (product list + Buy button)

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProducts } from '../api/client';
import ProductCard from '../components/ProductCard';
import type { Product } from '../../../shared/types/Product';

export default function ResultsPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!requestId) return;

    getProducts(requestId)
      .then((result) => {
        setProducts(result.products);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load products');
        setLoading(false);
      });
  }, [requestId]);

  const handleBuy = (productId: string) => {
    alert(`Phase 4: Buy functionality not yet implemented for product ${productId}`);
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '50px auto', padding: '20px' }}>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h2>Loading products...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '1200px', margin: '50px auto', padding: '20px' }}>
        <div style={{ color: 'red', padding: '20px', border: '1px solid red', borderRadius: '4px' }}>
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '50px auto', padding: '20px' }}>
      <h1 style={{ marginBottom: '10px' }}>Search Results</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Request ID: {requestId} | Found {products.length} product(s)
      </p>

      {products.length === 0 ? (
        <div style={{ padding: '50px', textAlign: 'center', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
          <h3>No products found</h3>
          <p>Try a different search query</p>
          <a href="/" style={{ color: '#007bff' }}>← Back to Search</a>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '20px',
        }}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onBuy={handleBuy} />
          ))}
        </div>
      )}
    </div>
  );
}
