// Service: Purchase business logic

import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { Cart, CartItem } from '../../shared/types/Cart';
import { Order } from '../../shared/types/Order';
import { PurchaseRequest, PurchaseResult } from '../../shared/types/Services';
import { BrowserManager } from '../automation/BrowserManager';
import { SauceDemoAdapter } from '../automation/SauceDemoAdapter';
import { loggerInstance } from '../observability/Logger';
import { traceStoreInstance } from '../observability/TraceStore';
import { storeInstance } from '../storage/InMemoryStore';

export interface IPurchaseService {
  executePurchase(request: PurchaseRequest): Promise<PurchaseResult>;
}

export class PurchaseService implements IPurchaseService {
  private browserManager = new BrowserManager();
  private adapter = new SauceDemoAdapter();

  async executePurchase(request: PurchaseRequest): Promise<PurchaseResult> {
    const { requestId, shippingDetails } = request;
    const startTime = Date.now();

    try {
      const products = storeInstance.getProducts(requestId);
      if (!products || products.length === 0) {
        throw new Error(`No products found for requestId: ${requestId}`);
      }

      const cheapestProduct = products.reduce((min, product) =>
        product.price < min.price ? product : min
      );

      loggerInstance.info({
        requestId,
        step: 'purchase-started',
        message: `Purchase initiated for product: "${cheapestProduct.title}" ($${cheapestProduct.price})`,
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

      await this.stepWithTrace(requestId, 'add-to-cart', async () => {
        await this.adapter.addToCart(page!, cheapestProduct.id);
        loggerInstance.info({
          requestId,
          step: 'add-to-cart',
          message: `Added "${cheapestProduct.title}" to cart`,
        });
      });

      await this.stepWithTrace(requestId, 'checkout-form', async () => {
        await this.adapter.checkout(page!, shippingDetails);
        loggerInstance.info({
          requestId,
          step: 'checkout-form',
          message: `Checkout completed for ${shippingDetails.firstName} ${shippingDetails.lastName}`,
        });
      });

      const screenshotDir = process.env.SCREENSHOT_DIR || './artifacts/screenshots';
      const screenshotPath = path.join(screenshotDir, `${requestId}-checkout.png`);

      await this.stepWithTrace(requestId, 'screenshot', async () => {
        await this.adapter.takeScreenshot(page!, screenshotPath);
        loggerInstance.info({
          requestId,
          step: 'screenshot',
          message: `Screenshot saved to ${screenshotPath}`,
        });
      });

      const cart: Cart = {
        requestId,
        items: [{
          product: cheapestProduct,
          quantity: 1,
        }],
        subtotal: cheapestProduct.price,
        total: cheapestProduct.price,
        currency: cheapestProduct.currency,
      };

      const order: Order = {
        requestId,
        cart,
        shippingDetails,
        timestamp: new Date().toISOString(),
        status: 'completed',
        screenshotPath,
      };

      storeInstance.saveCart(requestId, cart);
      storeInstance.saveOrder(requestId, order);

      await this.browserManager.close();

      const totalDuration = Date.now() - startTime;
      traceStoreInstance.setTotalDuration(requestId, totalDuration);

      loggerInstance.info({
        requestId,
        step: 'purchase-completed',
        duration: totalDuration,
        message: `Purchase completed successfully`,
      });

      return {
        order,
        screenshotPath,
      };
    } catch (error) {
      await this.browserManager.close();

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      const failedOrder: Order = {
        requestId,
        cart: { requestId, items: [], subtotal: 0, total: 0, currency: 'USD' },
        shippingDetails,
        timestamp: new Date().toISOString(),
        status: 'failed',
        error: errorMessage,
      };
      storeInstance.saveOrder(requestId, failedOrder);

      loggerInstance.error({
        requestId,
        step: 'purchase-failed',
        message: `Purchase failed: ${errorMessage}`,
        error: errorMessage,
      });

      throw new Error(`Purchase failed: ${errorMessage}`);
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

export const purchaseServiceInstance = new PurchaseService();
