// Automation: Selectors and timeout configuration for SauceDemo

export const SELECTORS = {
  // Login
  loginUsername: '#user-name',
  loginPassword: '#password',
  loginButton: '#login-button',

  // Product catalog
  productItem: '.inventory_item',
  productTitle: '.inventory_item_name',
  productPrice: '.inventory_item_price',
  productImage: 'img.inventory_item_img',
  addToCartButton: 'button[id^="add-to-cart"]',

  // Cart
  cartIcon: '.shopping_cart_link',
  cartItem: '.cart_item',
  checkoutButton: '#checkout',

  // Checkout form
  firstNameInput: '#first-name',
  lastNameInput: '#last-name',
  postalCodeInput: '#postal-code',
  continueButton: '#continue',
  finishButton: '#finish',

  // Confirmation
  confirmationMessage: '.complete-header',
};

export const TIMEOUTS = {
  navigation: 30000,        // 30s for page loads
  element: 10000,           // 10s for element waits
  retry: {
    attempts: 3,            // Retry 3 times
    backoffMs: 2000,        // 2s base backoff (exponential)
  },
};

export const SAUCEDEMO_URL = 'https://www.saucedemo.com';
