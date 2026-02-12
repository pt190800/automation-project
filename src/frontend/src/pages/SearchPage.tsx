// UI: Search page (query + filters input)

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchProducts } from '../api/client';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await searchProducts({ query: query.trim() });
      navigate(`/results/${result.requestId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
      <h1 style={{ marginBottom: '20px' }}>E-commerce Search</h1>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="query" style={{ display: 'block', marginBottom: '5px' }}>
            Search for products:
          </label>
          <input
            id="query"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., backpack"
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        </div>

        {error && (
          <div style={{ color: 'red', marginBottom: '15px' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <h3 style={{ marginTop: 0 }}>Phase 3: Search → Scrape → Results</h3>
        <p style={{ fontSize: '14px', color: '#666' }}>
          This will launch Playwright, scrape SauceDemo products, and display results.
        </p>
      </div>
    </div>
  );
}
