// API: Express route definitions

import { Router, Request, Response } from 'express';
import { searchServiceInstance } from '../services/SearchService';
import { storeInstance } from '../storage/InMemoryStore';
import { traceStoreInstance } from '../observability/TraceStore';
import { SearchRequest } from '../../shared/types/Services';

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
