// Automation: Playwright browser lifecycle management

import { chromium, Browser, BrowserContext, Page } from 'playwright';

export interface BrowserConfig {
  headless: boolean;
  timeout: number;
  viewport: { width: number; height: number };
}

export class BrowserManager {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;

  async launch(config: BrowserConfig): Promise<void> {
    this.browser = await chromium.launch({
      headless: config.headless,
      timeout: config.timeout,
    });

    this.context = await this.browser.newContext({
      viewport: config.viewport,
    });
  }

  async newPage(): Promise<Page> {
    if (!this.context) {
      throw new Error('Browser not launched. Call launch() first.');
    }
    return this.context.newPage();
  }

  async close(): Promise<void> {
    if (this.context) {
      await this.context.close();
      this.context = null;
    }
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
