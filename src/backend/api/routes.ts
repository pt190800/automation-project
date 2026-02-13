// API: Express route definitions

import { Router, Request, Response } from 'express';
import path from 'path';
import { searchServiceInstance } from '../services/SearchService';
import { purchaseServiceInstance } from '../services/PurchaseService';
import { storeInstance } from '../storage/InMemoryStore';
import { traceStoreInstance } from '../observability/TraceStore';
import { SearchRequest, PurchaseRequest } from '../../shared/types/Services';

export const router = Router();

router.post('/search', async (req: Request, res: Response) => {
  try {
    const searchRequest: SearchRequest = req.body;

    if (!searchRequest.query || searchRequest.query.trim() === '') {
      return res.status(400).json({
        error: 'Query is required',
      });
    }

    const result = await searchServiceInstance.executeSearch(searchRequest);

    res.json({
      requestId: result.requestId,
      status: 'completed',
      products: result.products,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: `Search failed: ${message}`,
    });
  }
});

router.get('/products/:requestId', (req: Request, res: Response) => {
  const { requestId } = req.params;
  const products = storeInstance.getProducts(requestId);

  if (!products) {
    return res.status(404).json({
      error: 'Products not found for this requestId',
    });
  }

  res.json({ products });
});

router.get('/status/:requestId', (req: Request, res: Response) => {
  const { requestId } = req.params;
  const trace = traceStoreInstance.getTrace(requestId);

  if (!trace) {
    return res.status(404).json({
      error: 'Trace not found for this requestId',
    });
  }

  res.json({ trace });
});

router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

router.post('/purchase', async (req: Request, res: Response) => {
  try {
    const purchaseRequest: PurchaseRequest = req.body;

    if (!purchaseRequest.requestId || purchaseRequest.requestId.trim() === '') {
      return res.status(400).json({ error: 'requestId is required' });
    }

    if (!purchaseRequest.shippingDetails) {
      return res.status(400).json({ error: 'shippingDetails is required' });
    }

    const { firstName, lastName, postalCode } = purchaseRequest.shippingDetails;
    if (!firstName || !lastName || !postalCode) {
      return res.status(400).json({
        error: 'firstName, lastName, and postalCode are required',
      });
    }

    const result = await purchaseServiceInstance.executePurchase(purchaseRequest);

    res.json({
      requestId: result.order.requestId,
      status: 'completed',
      order: result.order,
      screenshotPath: result.screenshotPath,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: `Purchase failed: ${message}`,
    });
  }
});

router.get('/orders/:requestId', (req: Request, res: Response) => {
  const { requestId } = req.params;
  const order = storeInstance.getOrder(requestId);

  if (!order) {
    return res.status(404).json({
      error: 'Order not found for this requestId',
    });
  }

  res.json({ order });
});

router.get('/screenshots/:filename', (req: Request, res: Response) => {
  const { filename } = req.params;
  const screenshotDir = process.env.SCREENSHOT_DIR || './artifacts/screenshots';
  const filePath = path.join(screenshotDir, filename);

  res.sendFile(path.resolve(filePath), (err) => {
    if (err) {
      res.status(404).json({
        error: 'Screenshot not found',
      });
    }
  });
});
