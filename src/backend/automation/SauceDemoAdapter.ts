// Automation: Site-specific adapter for SauceDemo

import { Page } from 'playwright';
import { Product } from '../../shared/types/Product';
import { ShippingDetails } from '../../shared/types/Order';
import { SELECTORS, TIMEOUTS, SAUCEDEMO_URL } from './AutomationConfig';

export class SauceDemoAdapter {
  async login(page: Page, username: string, password: string): Promise<void> {
    await page.goto(SAUCEDEMO_URL, {
      waitUntil: 'networkidle',
      timeout: TIMEOUTS.navigation,
    });

    await page.locator(SELECTORS.loginUsername).waitFor({
      state: 'visible',
      timeout: TIMEOUTS.element,
    });

    await page.locator(SELECTORS.loginUsername).fill(username);
    await page.locator(SELECTORS.loginPassword).fill(password);
    await page.locator(SELECTORS.loginButton).click();

    await page.locator(SELECTORS.productItem).first().waitFor({
      state: 'visible',
      timeout: TIMEOUTS.element,
    });
  }

  async scrapeProducts(page: Page): Promise<Product[]> {
    await page.locator(SELECTORS.productItem).first().waitFor({
      state: 'visible',
      timeout: TIMEOUTS.element,
    });

    const productElements = page.locator(SELECTORS.productItem);
    const count = await productElements.count();
    const products: Product[] = [];

    for (let i = 0; i < count; i++) {
      const productEl = productElements.nth(i);

      const title = await productEl.locator(SELECTORS.productTitle).textContent();
      const priceText = await productEl.locator(SELECTORS.productPrice).textContent();
      const imageSrc = await productEl.locator(SELECTORS.productImage).getAttribute('src');

      if (!title || !priceText) continue;

      const priceMatch = priceText.match(/[\d.]+/);
      const price = priceMatch ? parseFloat(priceMatch[0]) : 0;
      const currency = priceText.includes('$') ? 'USD' : 'USD';
      const id = title.toLowerCase().replace(/\s+/g, '-');
      const productURL = `${SAUCEDEMO_URL}/inventory.html`;

      products.push({
        id,
        title: title.trim(),
        price,
        currency,
        productURL,
        source: 'saucedemo',
        imageURL: imageSrc ? (imageSrc.startsWith('http') ? imageSrc : `${SAUCEDEMO_URL}${imageSrc}`) : undefined,
        inStock: true,
      });
    }

    return products;
  }

  async addToCart(page: Page, productId: string): Promise<void> {
    await page.locator(SELECTORS.productItem).first().waitFor({
      state: 'visible',
      timeout: TIMEOUTS.element,
    });

    const productElements = page.locator(SELECTORS.productItem);
    const count = await productElements.count();

    let productFound = false;
    for (let i = 0; i < count; i++) {
      const productEl = productElements.nth(i);
      const title = await productEl.locator(SELECTORS.productTitle).textContent();

      if (title) {
        const derivedId = title.toLowerCase().replace(/\s+/g, '-');
        if (derivedId === productId) {
          const addButton = productEl.locator(SELECTORS.addToCartButton);
          await addButton.click();

          await page.locator(SELECTORS.cartIcon).waitFor({
            state: 'visible',
            timeout: TIMEOUTS.element,
          });

          productFound = true;
          break;
        }
      }
    }

    if (!productFound) {
      throw new Error(`Product with ID "${productId}" not found on page`);
    }
  }

  async checkout(page: Page, details: ShippingDetails): Promise<void> {
    await page.locator(SELECTORS.cartIcon).click();

    await page.locator(SELECTORS.checkoutButton).waitFor({
      state: 'visible',
      timeout: TIMEOUTS.element,
    });
    await page.locator(SELECTORS.checkoutButton).click();

    await page.locator(SELECTORS.firstNameInput).waitFor({
      state: 'visible',
      timeout: TIMEOUTS.element,
    });

    await page.locator(SELECTORS.firstNameInput).fill(details.firstName);
    await page.locator(SELECTORS.lastNameInput).fill(details.lastName);
    await page.locator(SELECTORS.postalCodeInput).fill(details.postalCode);

    await page.locator(SELECTORS.continueButton).click();

    await page.locator(SELECTORS.finishButton).waitFor({
      state: 'visible',
      timeout: TIMEOUTS.element,
    });
    await page.locator(SELECTORS.finishButton).click();

    await page.locator(SELECTORS.confirmationMessage).waitFor({
      state: 'visible',
      timeout: TIMEOUTS.element,
    });
  }

  async takeScreenshot(page: Page, path: string): Promise<void> {
    await page.locator(SELECTORS.confirmationMessage).waitFor({
      state: 'visible',
      timeout: TIMEOUTS.element,
    });

    await page.screenshot({
      path,
      fullPage: true,
    });
  }
}
