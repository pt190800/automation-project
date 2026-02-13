// UI: Checkout page (shipping form + result)

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { checkout, getProducts } from '../api/client';
import type { Product } from '../../../shared/types/Product';
import type { Order } from '../../../shared/types/Order';

export default function CheckoutPage() {
  const { requestId, productId } = useParams<{ requestId: string; productId: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<Order | null>(null);

  const [firstName, setFirstName] = useState('John');
  const [lastName, setLastName] = useState('Doe');
  const [postalCode, setPostalCode] = useState('12345');

  // Progress tracking for automation steps
  const [currentStep, setCurrentStep] = useState(0);
  const automationSteps = [
    '🔐 Logging in to SauceDemo...',
    '🛒 Adding product to cart...',
    '📝 Filling checkout form...',
    '✅ Completing order...',
    '📸 Capturing screenshot...',
  ];

  useEffect(() => {
    if (!requestId) return;

    getProducts(requestId)
      .then((result) => {
        const cheapest = result.products.reduce((min, p) => (p.price < min.price ? p : min));
        setProduct(cheapest);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load product');
        setLoading(false);
      });
  }, [requestId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!requestId) {
      setError('Request ID is missing');
      return;
    }

    setSubmitting(true);
    setError('');
    setCurrentStep(0);

    // Simulate progress through automation steps
    const progressInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < automationSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2500); // Advance every 2.5 seconds

    try {
      const result = await checkout({
        requestId,
        shippingDetails: {
          firstName,
          lastName,
          postalCode,
        },
      });

      clearInterval(progressInterval);
      setOrder(result.order);
    } catch (err) {
      clearInterval(progressInterval);
      setError(err instanceof Error ? err.message : 'Checkout failed');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
        <div
          style={{
            color: 'red',
            padding: '20px',
            border: '1px solid red',
            borderRadius: '4px',
          }}
        >
          <h3>Error</h3>
          <p>{error}</p>
          <a href={`/results/${requestId}`} style={{ color: '#007bff' }}>
            ← Back to Results
          </a>
        </div>
      </div>
    );
  }

  if (order) {
    return (
      <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
        <div
          style={{
            backgroundColor: '#d4edda',
            padding: '20px',
            borderRadius: '4px',
            marginBottom: '20px',
          }}
        >
          <h2 style={{ color: '#155724', marginBottom: '10px' }}>
            ✓ Order Confirmed!
          </h2>
          <p style={{ color: '#155724' }}>
            Thank you for your purchase, {order.shippingDetails.firstName}!
          </p>
        </div>

        <div
          style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '4px',
            marginBottom: '20px',
          }}
        >
          <h3>Order Details</h3>
          <p>
            <strong>Request ID:</strong> {order.requestId}
          </p>
          <p>
            <strong>Status:</strong> {order.status}
          </p>
          <p>
            <strong>Timestamp:</strong>{' '}
            {new Date(order.timestamp).toLocaleString()}
          </p>

          <h4 style={{ marginTop: '20px' }}>Shipping Address</h4>
          <p>
            {order.shippingDetails.firstName} {order.shippingDetails.lastName}
            <br />
            Postal Code: {order.shippingDetails.postalCode}
          </p>

          <h4 style={{ marginTop: '20px' }}>Items</h4>
          {order.cart.items.map((item) => (
            <div
              key={item.product.id}
              style={{
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                marginBottom: '10px',
              }}
            >
              <p>
                <strong>{item.product.title}</strong>
              </p>
              <p>
                Price: ${item.product.price.toFixed(2)} {item.product.currency}
              </p>
              <p>Quantity: {item.quantity}</p>
            </div>
          ))}

          <p
            style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '10px' }}
          >
            Total: ${order.cart.total.toFixed(2)} {order.cart.currency}
          </p>
        </div>

        {order.screenshotPath && (
          <div
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '4px',
              marginBottom: '20px',
            }}
          >
            <h3>Order Confirmation Screenshot</h3>
            <img
              src={`/api/screenshots/${requestId}-checkout.png`}
              alt="Order confirmation"
              style={{
                maxWidth: '100%',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: '20px' }}>
          <a href="/" style={{ color: '#007bff' }}>
            ← Start New Search
          </a>
          <a href={`/status/${requestId}`} style={{ color: '#007bff' }}>
            📊 View Automation Trace
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      <h1 style={{ marginBottom: '20px' }}>Checkout</h1>

      {product && (
        <div
          style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '4px',
            marginBottom: '20px',
          }}
        >
          <h3>Product Selected (Cheapest)</h3>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            {product.imageURL && (
              <img
                src={product.imageURL}
                alt={product.title}
                style={{ width: '100px', height: '100px', objectFit: 'contain' }}
              />
            )}
            <div>
              <p style={{ fontSize: '18px', fontWeight: 'bold' }}>
                {product.title}
              </p>
              <p style={{ fontSize: '24px', color: '#007bff' }}>
                ${product.price.toFixed(2)} {product.currency}
              </p>
            </div>
          </div>
        </div>
      )}

      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '4px' }}>
        <h3 style={{ marginBottom: '20px' }}>Shipping Information</h3>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label
              htmlFor="firstName"
              style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: 'bold',
              }}
            >
              First Name *
            </label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label
              htmlFor="lastName"
              style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: 'bold',
              }}
            >
              Last Name *
            </label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label
              htmlFor="postalCode"
              style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: 'bold',
              }}
            >
              Postal Code *
            </label>
            <input
              type="text"
              id="postalCode"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
          </div>

          {submitting && (
            <div
              style={{
                backgroundColor: '#e7f3ff',
                padding: '15px',
                borderRadius: '4px',
                marginBottom: '15px',
                border: '1px solid #b3d9ff',
              }}
            >
              <h4 style={{ marginTop: 0, marginBottom: '10px', color: '#0056b3' }}>
                Processing Your Order...
              </h4>
              {automationSteps.map((step, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '8px',
                    opacity: index <= currentStep ? 1 : 0.4,
                  }}
                >
                  {index < currentStep ? (
                    <span style={{ fontSize: '18px' }}>✓</span>
                  ) : index === currentStep ? (
                    <span style={{ fontSize: '18px' }}>⏳</span>
                  ) : (
                    <span style={{ fontSize: '18px' }}>⏺</span>
                  )}
                  <span style={{ fontSize: '14px' }}>{step}</span>
                </div>
              ))}
            </div>
          )}

          {error && !submitting && (
            <div
              style={{
                color: 'red',
                padding: '10px',
                backgroundColor: '#f8d7da',
                borderRadius: '4px',
                marginBottom: '15px',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: submitting ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Processing...' : 'Complete Purchase'}
          </button>
        </form>

        <div style={{ marginTop: '15px', textAlign: 'center' }}>
          <a href={`/results/${requestId}`} style={{ color: '#007bff' }}>
            ← Back to Results
          </a>
        </div>
      </div>
    </div>
  );
}
