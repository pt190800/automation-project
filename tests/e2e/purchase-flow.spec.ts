// E2E test: Full purchase flow with screenshot proof

import { test, expect } from '@playwright/test';
import * as fs from 'fs';

test.describe('E2E Purchase Flow', () => {
  test.setTimeout(120000); // Automation against real site needs extra time

  test('should complete search → add to cart → checkout with screenshot proof', async ({ request }) => {
    // Step 1: Search for products
    const searchResponse = await request.post('/api/search', {
      data: { query: 'sauce' },
    });
    expect(searchResponse.ok()).toBeTruthy();

    const searchResult = await searchResponse.json();
    expect(searchResult.requestId).toBeTruthy();
    expect(Array.isArray(searchResult.products)).toBeTruthy();
    expect(searchResult.products.length).toBeGreaterThan(0);

    const { requestId } = searchResult;

    // Step 2: Verify products are stored and retrievable
    const productsResponse = await request.get(`/api/products/${requestId}`);
    expect(productsResponse.ok()).toBeTruthy();

    const productsResult = await productsResponse.json();
    expect(productsResult.products.length).toBeGreaterThan(0);

    // Step 3: Execute purchase (automation: login → cart → checkout → screenshot)
    const purchaseResponse = await request.post('/api/purchase', {
      data: {
        requestId,
        shippingDetails: {
          firstName: 'Test',
          lastName: 'User',
          postalCode: '12345',
        },
      },
    });
    expect(purchaseResponse.ok()).toBeTruthy();

    const purchaseResult = await purchaseResponse.json();
    expect(purchaseResult.status).toBe('completed');
    expect(purchaseResult.order).toBeDefined();
    expect(purchaseResult.order.status).toBe('completed');
    expect(purchaseResult.screenshotPath).toBeTruthy();

    // Step 4: Verify screenshot file exists on disk
    expect(fs.existsSync(purchaseResult.screenshotPath)).toBeTruthy();

    // Step 5: Verify order is persisted and retrievable
    const orderResponse = await request.get(`/api/orders/${requestId}`);
    expect(orderResponse.ok()).toBeTruthy();

    const orderResult = await orderResponse.json();
    expect(orderResult.order.status).toBe('completed');
    expect(orderResult.order.cart.items.length).toBeGreaterThan(0);
  });

  test('should return 400 for empty search query', async ({ request }) => {
    const response = await request.post('/api/search', {
      data: { query: '' },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeTruthy();
  });

  test('should return 400 for missing purchase fields', async ({ request }) => {
    const response = await request.post('/api/purchase', {
      data: { requestId: '' },
    });
    expect(response.status()).toBe(400);
  });

  test('should return 404 for non-existent products requestId', async ({ request }) => {
    const response = await request.get('/api/products/non-existent-id-12345');
    expect(response.status()).toBe(404);
  });

  test('should block path traversal in screenshots endpoint', async ({ request }) => {
    const response = await request.get('/api/screenshots/..%2Fpackage.json');
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('should return health ok', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.status).toBe('ok');
  });
});
