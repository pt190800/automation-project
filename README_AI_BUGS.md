# AI Bug Tracking

This document tracks bugs, issues, and incorrect suggestions from AI tools during development.

## Bug Template

Use this template for each bug entry:

```markdown
## Bug #X: [Short Description]

- **Date**: YYYY-MM-DD
- **Phase**: [Phase 3, 4, 5, etc.]
- **AI Tool**: [Tool name]
- **AI Suggestion**:
  ```
  [Exact code/advice the AI provided]
  ```
- **Problem**: [What was wrong - functionality, security, performance, etc.]
- **Impact**: [Severity: Critical/High/Medium/Low]
- **Resolution**:
  ```
  [Correct code/approach]
  ```
- **Root Cause**: [Why the AI made this mistake]
- **Prevention**: [How to avoid this in the future]
```

---

## Bug #1: Wrong Password Selector

- **Date**: 2026-02-11
- **Phase**: Phase 3 (Search Implementation)
- **AI Tool**: Claude Code (Sonnet 4.5)
- **AI Suggestion**:
  ```typescript
  // AutomationConfig.ts
  export const SELECTORS = {
    loginUsername: '#user-name',
    loginPassword: '#login-password',  // ❌ INCORRECT
    loginButton: '#login-button',
  };
  ```
- **Problem**: The selector `#login-password` does not exist on SauceDemo. The actual selector is `#password`. This caused a timeout error during login: `locator('#login-password') timeout waiting for element`.
- **Impact**: **HIGH** - Complete failure of login flow, blocking the entire automation pipeline.
- **Resolution**:
  ```typescript
  // AutomationConfig.ts
  export const SELECTORS = {
    loginUsername: '#user-name',
    loginPassword: '#password',  // ✅ CORRECT
    loginButton: '#login-button',
  };
  ```
- **Root Cause**: AI assumed a common naming pattern (`#login-password`) without verifying the actual DOM structure of the SauceDemo website.
- **Prevention**:
  - Always verify selectors by inspecting the actual website DOM using browser DevTools
  - Test selectors manually before implementation
  - Prefer data-testid attributes when available for stability

---

## Bug #2: Non-Unique Image Selector (Strict Mode Violation)

- **Date**: 2026-02-11
- **Phase**: Phase 3 (Search Implementation)
- **AI Tool**: Claude Code (Sonnet 4.5)
- **AI Suggestion**:
  ```typescript
  // AutomationConfig.ts
  export const SELECTORS = {
    productImage: '.inventory_item_img',  // ❌ MATCHES 2 ELEMENTS
  };
  ```
- **Problem**: The class `.inventory_item_img` exists on BOTH the container `<div>` element AND the `<img>` element within it. Playwright's strict mode requires selectors to match exactly one element, causing error: `strict mode violation: locator('.inventory_item_img') resolved to 2 elements`.
- **Impact**: **HIGH** - Product scraping fails completely, no images retrieved from the page.
- **Resolution**:
  ```typescript
  // AutomationConfig.ts
  export const SELECTORS = {
    productImage: 'img.inventory_item_img',  // ✅ SPECIFIC TO IMG TAG
  };
  ```
- **Root Cause**: AI used a class selector without considering the element type, violating Playwright's strict mode requirement for unique element matching.
- **Prevention**:
  - Always prefix class selectors with element type when the class is not unique (e.g., `img.class`, `button.class`)
  - Test selectors with `.count()` during development to ensure they match exactly one element
  - Keep Playwright strict mode enabled to catch these issues early

---

## Bug #3: Relative Image URLs Not Resolved

- **Date**: 2026-02-11
- **Phase**: Phase 3 (Search Implementation)
- **AI Tool**: Claude Code (Sonnet 4.5)
- **AI Suggestion**:
  ```typescript
  // SauceDemoAdapter.ts
  const imageSrc = await productEl.locator(SELECTORS.productImage).getAttribute('src');

  products.push({
    // ...other fields
    imageURL: imageSrc || undefined,  // ❌ RELATIVE PATH
  });
  ```
- **Problem**: SauceDemo returns relative image URLs (e.g., `/static/media/sauce-backpack.jpg`). When the frontend tries to display these images, the browser interprets them as relative to `localhost:5173` instead of `saucedemo.com`, causing 404 errors.
- **Impact**: **MEDIUM** - Application is functional but user experience is degraded (no product images display).
- **Resolution**:
  ```typescript
  // SauceDemoAdapter.ts
  imageURL: imageSrc
    ? (imageSrc.startsWith('http')
        ? imageSrc
        : `${SAUCEDEMO_URL}${imageSrc}`)
    : undefined,  // ✅ CONVERTS TO ABSOLUTE URL
  ```
- **Root Cause**: AI did not consider cross-origin image loading when scraping from an external site. Relative URLs work in the scraping context but fail when passed to a different origin (frontend).
- **Prevention**:
  - Always convert relative URLs to absolute URLs when scraping external sites
  - Test actual frontend rendering, not just data scraping
  - Consider CORS implications for external resources

---

## Summary Statistics

| Category | Count | Notes |
|----------|-------|-------|
| Selector Issues | 2 | Password selector, Image selector strict mode |
| Wait/Timeout Issues | 0 | None encountered (explicit waits work correctly) |
| Security Issues | 0 | No secrets leaked, .env properly configured |
| Logic Errors | 1 | Relative URL handling |
| Performance Issues | 0 | None encountered |
| **Total Bugs** | 3 | All fixed and documented |

---

## Severity Distribution

| Severity | Count | Percentage |
|----------|-------|------------|
| Critical | 0 | 0% |
| High | 2 | 67% |
| Medium | 1 | 33% |
| Low | 0 | 0% |

---

## Lessons Learned

1. **Selector Verification is Mandatory**: Never trust AI-generated selectors without manual DOM inspection
2. **Strict Mode is Your Friend**: Playwright's strict mode catches ambiguous selectors early
3. **Test in Target Environment**: Always test scraped data in the actual frontend, not just in isolation
4. **Cross-Origin Awareness**: When scraping external sites, be mindful of URL resolution and CORS
5. **Incremental Testing**: Test each component immediately after implementation to catch bugs early

---

**Last Updated**: 2026-02-11 (Phase 3 Complete)
