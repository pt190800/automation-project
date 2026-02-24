// Service: Search business logic

import { v4 as uuidv4 } from 'uuid';
import { SearchRequest, SearchResult } from '../../shared/types/Services';
import { Product } from '../../shared/types/Product';
import { BrowserManager } from '../automation/BrowserManager';
import { SauceDemoAdapter } from '../automation/SauceDemoAdapter';
import { loggerInstance } from '../observability/Logger';
import { traceStoreInstance } from '../observability/TraceStore';
import { storeInstance } from '../storage/InMemoryStore';

export class SearchService {
  private browserManager = new BrowserManager();
  private adapter = new SauceDemoAdapter();

  async executeSearch(request: SearchRequest): Promise<SearchResult> {
    const requestId = uuidv4();
    const startTime = Date.now();

    try {
      storeInstance.saveRequest(requestId, request.query);
      traceStoreInstance.initTrace(requestId, request.query);

      loggerInstance.info({
        requestId,
        step: 'search-started',
        message: `Search initiated for query: "${request.query}"`,
      });

      await this.stepWithTrace(requestId, 'browser-launch', async () => {
        const headless = process.env.BROWSER_HEADLESS === 'true';
        await this.browserManager.launch({
          headless,
          timeout: parseInt(process.env.BROWSER_TIMEOUT || '30000'),
          viewport: { width: 1280, height: 720 },
        });
      });

      let page;
      await this.stepWithTrace(requestId, 'login', async () => {
        page = await this.browserManager.newPage();
        const username = process.env.SAUCE_USERNAME || 'standard_user';
        const password = process.env.SAUCE_PASSWORD || 'secret_sauce';
        await this.adapter.login(page, username, password);
      });

      let allProducts: Product[] = [];
      await this.stepWithTrace(requestId, 'scrape', async () => {
        allProducts = await this.adapter.scrapeProducts(page!);
        loggerInstance.info({
          requestId,
          step: 'scrape',
          message: `Scraped ${allProducts!.length} products`,
        });
      });

      let filteredProducts: Product[] = [];
      await this.stepWithTrace(requestId, 'filter', async () => {
        const query = request.query.toLowerCase();
        filteredProducts = allProducts!.filter((p) =>
          p.title.toLowerCase().includes(query)
        );

        if (request.filters?.maxPrice) {
          filteredProducts = filteredProducts.filter((p) => p.price <= request.filters!.maxPrice!);
        }

        if (request.filters?.sortBy === 'price-asc') {
          filteredProducts.sort((a, b) => a.price - b.price);
        } else if (request.filters?.sortBy === 'price-desc') {
          filteredProducts.sort((a, b) => b.price - a.price);
        } else if (request.filters?.sortBy === 'name') {
          filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
        }

        loggerInstance.info({
          requestId,
          step: 'filter',
          message: `Filtered to ${filteredProducts!.length} products matching "${request.query}"`,
        });
      });

      storeInstance.saveProducts(requestId, filteredProducts!);
      await this.browserManager.close();

      const totalDuration = Date.now() - startTime;
      traceStoreInstance.setTotalDuration(requestId, totalDuration);

      loggerInstance.info({
        requestId,
        step: 'search-completed',
        duration: totalDuration,
        message: `Search completed successfully`,
      });

      return {
        requestId,
        products: filteredProducts!,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      await this.browserManager.close();
      traceStoreInstance.setFailed(requestId);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      loggerInstance.error({
        requestId,
        step: 'search-failed',
        message: `Search failed: ${errorMessage}`,
        error: errorMessage,
      });
      throw new Error(`Search failed: ${errorMessage}`);
    }
  }

  private async stepWithTrace(
    requestId: string,
    stepName: string,
    action: () => Promise<void>
  ): Promise<void> {
    const startTime = Date.now();

    traceStoreInstance.addStep(requestId, {
      stepName,
      status: 'running',
      startTime,
    });

    try {
      await action();
      const duration = Date.now() - startTime;

      traceStoreInstance.updateStep(requestId, stepName, {
        status: 'success',
        duration,
      });

      loggerInstance.info({
        requestId,
        step: stepName,
        duration,
        message: `Step completed successfully`,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      traceStoreInstance.updateStep(requestId, stepName, {
        status: 'failed',
        duration,
        error: errorMessage,
      });

      loggerInstance.error({
        requestId,
        step: stepName,
        duration,
        message: `Step failed: ${errorMessage}`,
        error: errorMessage,
      });

      throw error;
    }
  }
}

export const searchServiceInstance = new SearchService();
