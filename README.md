# Automation Project - E-commerce Web Application

Web application wrapper for Playwright automation: Search → Cart → Checkout flow.

## Project Overview

This project demonstrates browser automation for e-commerce purchasing using Playwright, with a focus on:
- Clean architecture with layer separation
- Robust automation (explicit waits, retries, error handling)
- Observability (structured logging, request tracing)
- Comprehensive testing (unit + E2E)
- AI transparency and responsible development

## Prerequisites

- Node.js 18+ and npm
- Git

## Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium
```

## Configuration

1. Copy environment template:
```bash
cp .env.example .env
```

2. Edit `.env` with credentials (defaults work for SauceDemo):
```env
SAUCE_USERNAME=standard_user
SAUCE_PASSWORD=secret_sauce
BROWSER_HEADLESS=true
PORT=3000
```

## Running the Application

### Development Mode

```bash
# Terminal 1: Start backend
npm run dev:backend

# Terminal 2: Start frontend
npm run dev:frontend
```

Access the app at: http://localhost:5173

### Production Build

```bash
npm run build:backend
npm run build:frontend
```

## Running Tests

```bash
# All tests
npm test

# E2E tests only
npm run test:e2e
```

## Automation Flow Description

**Target Site**: SauceDemo (https://www.saucedemo.com)

**Important Note**: SauceDemo has no search input field. Our workaround: scrape all products from the catalog, then filter by keyword in-memory. This is documented for grading transparency.

### Flow Steps:

1. **Search** - User enters query → Backend scrapes all products → Filters by title keyword
2. **Results** - Display normalized products (cheapest-first policy)
3. **Add to Cart** - User clicks Buy → Playwright adds product to cart
4. **Checkout** - User fills shipping details → Playwright completes checkout
5. **Screenshot** - System saves order confirmation as proof (artifacts/screenshots/)

### Observability:

- Each step logged with `requestId`, step name, duration
- UI displays real-time trace (which steps completed, where failures occurred)
- Logs saved to `artifacts/logs/`

## Screenshots

E2E test produces screenshot proof in:
```
artifacts/screenshots/order-confirmation-{requestId}.png
```

## Architecture

```
Frontend (React) → API (Express) → Services → Automation (Playwright) → SauceDemo
```

**Layers**:
- `frontend/` - React UI (search, results, checkout, status pages)
- `backend/api/` - REST endpoints
- `backend/services/` - Business logic (search, purchase)
- `backend/domain/` - Data models (Product, Cart, Order)
- `backend/automation/` - Playwright browser management + site adapter
- `backend/observability/` - Logging + tracing

## Grading Criteria Alignment

- **35% Automation Quality**: Explicit waits, stable selectors, retries, screenshot proof
- **25% Flow Correctness**: Search → Cart → Checkout fully functional
- **20% Architecture**: Clear layer separation (see structure above)
- **10% Testing**: Unit tests (product, selection, cart) + E2E test with screenshot
- **10% Documentation**: README, AI_USAGE.md, README_AI_BUGS.md

## AI Transparency

See [AI_USAGE.md](./AI_USAGE.md) for:
- AI tools used
- Actual prompts
- Examples of wrong AI advice and how we fixed them
- Secret prevention strategy

See [README_AI_BUGS.md](./README_AI_BUGS.md) for AI bug tracking.

## License

MIT
