# AI Usage Transparency Document

**Assignment Requirement**: This document provides full transparency on AI tool usage, prompts, bugs discovered, and security practices during development.

---

## 1. AI Tools Used

### Primary Tool: Claude Code (Sonnet 4.5)
- **Model**: claude-sonnet-4-5-20250929
- **Interface**: VSCode Extension + CLI
- **Usage**: Full-stack development, architecture design, code generation, debugging, testing
- **Percentage of Code**: ~85% AI-generated with human review and approval at every phase

### Development Workflow:
1. Human defines requirements and approves each phase
2. AI designs architecture and implementation plan
3. Human reviews and requests modifications
4. AI implements with human verification
5. Human tests functionality and reports bugs
6. AI fixes bugs and documents learnings

---

## 2. Sample Prompts (As Written)

### Prompt #1: Initial Project Approval
```
YES. Proceed with: Node.js + TypeScript + Playwright, React + Vite frontend,
Express backend, Winston logging, In-memory store, Jest + Playwright Test,
SauceDemo target site. Phased approach with approval gates.
```
**Context**: Approving the technology stack after Phase 1 architecture review.

---

### Prompt #2: Architecture Adjustments
```
NO — pause before Phase 3. Quick check: Based on assignment, what are top 3
technical risks we should validate before implementing?
```
**Context**: Requesting risk analysis before proceeding with implementation.

---

### Prompt #3: Repository Structure Modifications
```
Please make the following changes:
1. Use Playwright Test for E2E (not Jest)
2. Separate test:unit and test:e2e scripts
3. Remove all 'any' types - use strict typing
4. Create shared types folder instead of backend/domain
```
**Context**: Refining the codebase structure based on assignment requirements.

---

### Prompt #4: Bug Report (Hebrew)
```
למה לא רואים את התמונה
```
**Translation**: "Why don't we see the image?"
**Context**: Reporting image display bug in the frontend after search results appeared.

---

### Prompt #5: Project Status Request (Hebrew)
```
תן לי בינתיים סקירה תמציתית על כל הפרוקט והסבר קצר כולל ארכיטקטורה
ומה אין ומה יש
```
**Translation**: "Give me a concise overview of the entire project and brief explanation including architecture and what there is and what there isn't"
**Context**: Requesting comprehensive status update after Phase 3 completion.

---

## 3. Incorrect/Dangerous AI Recommendations & Fixes

### Bug #1: Wrong Password Selector ⚠️ **HIGH SEVERITY**

**AI Suggestion**:
```typescript
// AutomationConfig.ts
export const SELECTORS = {
  loginUsername: '#user-name',
  loginPassword: '#login-password',  // ❌ WRONG
  loginButton: '#login-button',
};
```

**Problem**:
- The selector `#login-password` does not exist on SauceDemo
- Actual selector is `#password`
- Caused timeout error: `locator('#login-password') timeout waiting for element`

**Impact**: **HIGH** - Complete failure of login flow, blocking entire automation

**Resolution**:
```typescript
export const SELECTORS = {
  loginUsername: '#user-name',
  loginPassword: '#password',  // ✅ CORRECT
  loginButton: '#login-button',
};
```

**Root Cause**: AI assumed common naming pattern (`#login-password`) without verifying actual DOM structure

**Prevention**:
- ALWAYS verify selectors by inspecting the actual website DOM
- Use browser DevTools to test selectors before implementation
- Prefer data-testid attributes when available

---

### Bug #2: Non-Unique Image Selector ⚠️ **HIGH SEVERITY**

**AI Suggestion**:
```typescript
// AutomationConfig.ts
export const SELECTORS = {
  productImage: '.inventory_item_img',  // ❌ MATCHES 2 ELEMENTS
};
```

**Problem**:
- Class `.inventory_item_img` exists on BOTH the container `<div>` AND the `<img>` element
- Playwright strict mode violation: `locator('.inventory_item_img') resolved to 2 elements`
- Caused scraping to fail completely

**Impact**: **HIGH** - Product scraping fails, no images retrieved

**Resolution**:
```typescript
export const SELECTORS = {
  productImage: 'img.inventory_item_img',  // ✅ SPECIFIC
};
```

**Root Cause**: AI used class selector without considering element type, violating Playwright's strict mode

**Prevention**:
- Always use element type prefix for non-unique classes (e.g., `img.class`, `button.class`)
- Test selectors with `.count()` to ensure uniqueness
- Enable strict mode during development to catch these early

---

### Bug #3: Relative Image URLs Not Resolved ⚠️ **MEDIUM SEVERITY**

**AI Suggestion**:
```typescript
// SauceDemoAdapter.ts
const imageSrc = await productEl.locator(SELECTORS.productImage).getAttribute('src');
products.push({
  // ...
  imageURL: imageSrc || undefined,  // ❌ RELATIVE PATH
});
```

**Problem**:
- SauceDemo returns relative URLs: `/static/media/sauce-backpack.jpg`
- Frontend interprets as `localhost:5173/static/media/...` instead of `saucedemo.com/static/...`
- Images fail to load (404 errors)

**Impact**: **MEDIUM** - Functional but degraded UX (no images)

**Resolution**:
```typescript
imageURL: imageSrc
  ? (imageSrc.startsWith('http')
      ? imageSrc
      : `${SAUCEDEMO_URL}${imageSrc}`)
  : undefined,  // ✅ ABSOLUTE URL
```

**Root Cause**: AI didn't consider cross-origin image loading when scraping from external site

**Prevention**:
- Always convert relative URLs to absolute when scraping external sites
- Test image loading in the actual frontend, not just in scraper
- Consider CORS implications for external resources

---

### Security: Avoided Dangerous Patterns

**What AI Did Correctly** ✅:
1. **No Hardcoded Secrets**: Used `process.env` with `.env` file
2. **Gitignore Configured**: `.env` excluded from version control
3. **No Credentials in Logs**: Logging excludes sensitive data
4. **No eval() or exec()**: No dynamic code execution
5. **Input Validation**: Query validation in API routes

**What Could Have Gone Wrong** ❌:
- AI could have hardcoded `password: 'secret_sauce'` in code
- AI could have logged full request bodies (including potential tokens)
- AI could have suggested `eval()` for dynamic product filtering

---

## 4. Secret Management & Security

### Environment Variables (.env)
```bash
# Credentials (NEVER commit to git)
SAUCE_USERNAME=standard_user
SAUCE_PASSWORD=secret_sauce

# Configuration
BROWSER_HEADLESS=false
BROWSER_TIMEOUT=30000
PORT=3000
```

### Gitignore Protection
```gitignore
# From .gitignore
.env
.env.local
.env.*.local
artifacts/
logs/
screenshots/
```

### Code Practices
1. **No Hardcoded Secrets**: All credentials in `.env`
2. **Default Values**: Fallback to safe defaults (`|| 'standard_user'`)
3. **No Secret Logging**: Winston logger excludes passwords/tokens
4. **No Client-Side Secrets**: Backend handles all credentials
5. **CORS Configured**: Only necessary origins allowed

### Verification
```bash
# Check for accidental secret commits
git log -p | grep -i "password\|secret\|token\|api_key"  # Should return nothing

# Check .env is ignored
git status  # Should not show .env file
```

---

## 5. AI Collaboration Summary

### Strengths of AI Usage:
- ✅ Rapid prototyping and boilerplate generation
- ✅ Consistent code style and TypeScript typing
- ✅ Comprehensive error handling
- ✅ Good architectural patterns (clean architecture, separation of concerns)
- ✅ Detailed logging and observability

### Limitations Encountered:
- ❌ AI cannot inspect live websites (requires human verification)
- ❌ Selector assumptions may not match reality
- ❌ Context switching between frontend/backend requires careful state management
- ❌ AI may suggest "common patterns" that don't apply to specific sites

### Best Practices Learned:
1. **Always Verify**: Test AI-generated selectors in browser DevTools
2. **Incremental Testing**: Test each phase before moving to next
3. **Human-in-the-Loop**: Review and approve all significant changes
4. **Bug Documentation**: Track every AI mistake for transparency
5. **Security Review**: Double-check all credential handling

---

## 6. Statistics

| Metric | Count |
|--------|-------|
| **Total Bugs Fixed** | 3 |
| **High Severity** | 2 |
| **Medium Severity** | 1 |
| **Security Issues Prevented** | 0 |
| **Lines of Code Generated** | ~2,500+ |
| **Human Review Cycles** | 15+ |
| **Phase Approvals Required** | 3 (so far) |

---

## 7. Compliance Checklist

- [x] AI tools disclosed (Claude Code - Sonnet 4.5)
- [x] 5 actual prompts documented
- [x] 3 incorrect AI recommendations documented with fixes
- [x] Secret management strategy explained
- [x] `.env` + `.gitignore` configured
- [x] No credentials in code or logs
- [x] All bugs tracked in `README_AI_BUGS.md`

---

**Document Version**: 1.0
**Last Updated**: 2026-02-11
**Phase Completed**: Phase 3 (Search Flow)
**Next Phase**: Phase 4 (Cart + Checkout + Screenshot)
