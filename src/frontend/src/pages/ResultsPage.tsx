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

  // Price filter state
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!requestId) return;

    getProducts(requestId)
      .then((result) => {
        // Sort products by price (cheapest first)
        const sortedProducts = result.products.sort((a, b) => a.price - b.price);
        setProducts(sortedProducts);
        setFilteredProducts(sortedProducts);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load products');
        setLoading(false);
      });
  }, [requestId]);

  // Filter products by price when filters change
  useEffect(() => {
    let filtered = [...products];

    const min = minPrice ? parseFloat(minPrice) : 0;
    const max = maxPrice ? parseFloat(maxPrice) : Infinity;

    if (minPrice || maxPrice) {
      filtered = products.filter((p) => p.price >= min && p.price <= max);
    }

    setFilteredProducts(filtered);
  }, [products, minPrice, maxPrice]);

  const handleBuy = (productId: string) => {
    window.location.href = `/checkout/${requestId}/${productId}`;
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

  const handleClearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '50px auto', padding: '20px' }}>
      <h1 style={{ marginBottom: '10px' }}>Search Results</h1>
      <div style={{ marginBottom: '30px' }}>
        <p style={{ color: '#666', marginBottom: '10px' }}>
          Request ID: {requestId} | Found {products.length} product(s) |
          Showing {filteredProducts.length} product(s) | Sorted by price (cheapest first)
        </p>
        <a href={`/status/${requestId}`} style={{ color: '#007bff', fontSize: '14px' }}>
          📊 View Automation Trace
        </a>
      </div>

      {/* Price Filter */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '4px',
        marginBottom: '20px',
        border: '1px solid #ddd',
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '15px' }}>💰 Filter by Price</h3>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label htmlFor="minPrice" style={{ fontWeight: 'bold' }}>Min:</label>
            <input
              id="minPrice"
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              style={{
                width: '100px',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label htmlFor="maxPrice" style={{ fontWeight: 'bold' }}>Max:</label>
            <input
              id="maxPrice"
              type="number"
              placeholder="∞"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              style={{
                width: '100px',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
          </div>
          {(minPrice || maxPrice) && (
            <button
              onClick={handleClearFilters}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Clear Filters
            </button>
          )}
          {(minPrice || maxPrice) && (
            <span style={{ fontSize: '14px', color: '#28a745', fontWeight: 'bold' }}>
              ✓ Active filter: ${minPrice || '0'} - ${maxPrice || '∞'}
            </span>
          )}
        </div>
      </div>

      {filteredProducts.length === 0 && products.length > 0 ? (
        <div style={{ padding: '50px', textAlign: 'center', backgroundColor: '#fff3cd', borderRadius: '4px', border: '1px solid #ffc107' }}>
          <h3>No products match your price filter</h3>
          <p>Try adjusting the price range or <button onClick={handleClearFilters} style={{ color: '#007bff', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}>clear filters</button></p>
        </div>
      ) : products.length === 0 ? (
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
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onBuy={handleBuy} />
          ))}
        </div>
      )}
    </div>
  );
}
