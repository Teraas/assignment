# AI Usage Documentation

This document records how AI (Claude) was used during framework development, including specific prompts, responses, and corrections.

## Phase 1: Framework Design & Architecture

### Prompt 1: Analyzing Requirements
**What I asked Claude**:
> Analyze the Conduit app (blogging platform with React frontend, Express API).  I've verified both backend (localhost:3000/api) and frontend (localhost:4101) are running. Create Plan for test automation?

**Claude's Response**:
- Suggested domain-driven directory structure instead of flat POM
- Recommended verbose method naming for semantic understanding
- Proposed centralized API client
- Suggested fixture-based auth
- Key insight: "Limit the context window for AI agents - they should focus on one domain at a time"

**What Went Right**: This guidance was accurate and resulted in the core architecture.

**What Needed Fixing**: None - the architectural recommendations were solid.

---

### Prompt 2: Page Object Design
**What I asked Claude**:
> Design page objects for Login, Editor, Feed, Article pages. How do we make these agentic-first? What naming conventions?

**Claude's Suggestion**:
```typescript
 First attempt (too generic)// 
async click(selector: string): Promise<void> {
  await this.page.click(selector);
}
```

**My Correction**:
```typescript
//  Revised (agentic-first)
async clickSignInButton(): Promise<void> {
  /**
   * Click the sign-in button to submit login form.
   */
  await this.page.click('button:has-text("Sign in")');
}
```

**Learning**: Method names must describe INTENT not implementation. "clickSignInButton()" tells agents what the action does. "click(selector)" requires DOM knowledge.

---

## Phase 2: Core Infrastructure

### Prompt 3: Centralized API Client
**What I asked Claude**:
> Build an API client for Conduit that handles auth tokens, headers, and error responses. It needs to work with both user creation AND authenticated requests.

**Claude's Response**:
```typescript
export class ApiClient {
  private authToken: string | null = null;

  async post<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: 'POST', body });
  }

  setAuthToken(token: string): void {
    this.authToken = token;
  }
}
```

**Issue Found**: 
- Response typing wasn't specific enough - needed to support both `{ user: { ... } }` and `{ article: { ... } }`

**My Fix**:
```typescript
export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  data?: T;  // Generic T instead of specific shape
  errors?: Record<string, string[]>;
}
```

**Learning**: Generic types let the same client handle any response shape.

---

### Prompt 4: Playwright Fixtures
**What I asked Claude**:
> Create custom Playwright fixtures that automatically:
1. Create a test user via API
2. Set the auth token
3. Provide it to tests
4. Create a separate fixture for unauthenticated page tests

**Claude's Response**:
```typescript
export const test = base.extend<{
  authenticatedRequest: ApiClient;
  testUser: TestUser;
  unauthenticatedPage: Page;
}>({
  authenticatedRequest: async ({}, use) => {
    const client = new ApiClient();
    const testUser = await createTestUser(client);
    client.setAuthToken(testUser.token);
    await use(client);
  },
  // ...
});
```

**Issue Found**:
- Type errors with `unauthenticatedPage: typeof base` - should be `Page`
- Import cycle when fixtures tried to import from core modules

**My Fixes**:
```typescript
import { Page } from '@playwright/test';
// ... 
unauthenticatedPage: async ({ page }, use) => {
  await page.context().clearCookies();
  await use(page);
}
```

**Learning**: Fixtures work best when they handle setup/teardown transparently. Tests shouldn't know about fixtures - they just receive values.

---

## Phase 3: Test Implementation

### Prompt 5: API Test Pattern
**What I asked Claude**:
> Write an API authentication test that:
1. Registers a user
2. Logs them in
3. Verifies token
4. Tests error cases

**Claude's Response** (first attempt):
```typescript
test('should login', async ({ authenticatedRequest }) => {
  // User already authenticated via fixture
  // This is confusing for a login test!
});
```

**Issue**: Fixture creates authenticated user, but login test needs to test the login flow itself.

**My Correction**:
```typescript
test('should login user', async () => {
  // Use raw ApiClient, not fixture (fixture is for authenticated tests)
  const client = new ApiClient();
  const userData = generateUserData();
  
  // Register first
  await client.post('/users', { user: userData });
  
  // Then login
  const response = await client.post('/users/login', {
    user: { email: userData.email, password: userData.password }
  });
  
  expect(response.success).toBe(true);
});
```

**Learning**: Some tests need raw API client (login tests), others need fixtures (authenticated feature tests). Both patterns are valid.

---

### Prompt 6: UI Test with Page Objects
**What I asked Claude**:
> Write a UI test that logs in via form. Use the LoginPageObject pattern.

**Claude's Initial Approach**:
```typescript
test('should login', async ({ page }) => {
  const loginPage = new LoginPageObject(page);
  await loginPage.navigateToLoginPage();
  // ...
  await page.waitForTimeout( Manual wait1000); // 
});
```

**Issue**: Hard-coded timeouts are fragile. Better to use Playwright's built-in waits.

**My Correction**:
```typescript
test('should login', async ({ page }) => {
  const loginPage = new LoginPageObject(page);
  await loginPage.navigateToLoginPage();
  await loginPage.performCompleteLoginFlow(email, password);
  await loginPage.waitForNavigationToFeedPage Proper wait(); // 
});
```

**Page Object Addition**:
```typescript
async waitForNavigationToFeedPage(): Promise<void> {
  await this.page.waitForNavigation({ waitUntil: 'networkidle' });
}
```

**Learning**: Timeouts belong in page objects where they can be centralized and reused.

---

### Prompt 7: End-to-End Test  
**What I asked Claude**:
> Write an E2E test that:
1. Creates user via API (fixture)
2. Logs in via UI
3. Creates article
4. Adds comment
5. Favorites

**Claude's Response**: 
 Correctly used multiple domains (API creation, UI interaction)
 Properly created and used fixtures
 Clear test steps with good comments

**Minor Issues**:
- Initial version used `page.waitForTimeout()` instead of `page.waitForLoadState()`
- Fixed in revision

---

## Phase 4: Critical Learnings When AI Generates Tests

### What Works 
1. **Pattern Recognition**: Claude can look at 1-2 existing tests and write similar ones correctly
2. **Type Checking**: TypeScript caught most errors (missing imports, type mismatches)
3. **Consistency**: Once the pattern is established, AI maintains it well
4. **Documentation**: Claude wrote good JSDoc when prompted

### What Needs Oversight 
1. **DOM Selectors**: AI might write fragile selectors. Manual review needed.
   ```typescript
 What Claude suggested   // 
   await page.click('button'); // Too generic
   
 What I fixed   // 
   await this.page.click('button:has-text("Sign in")'); // Specific
   ```

2. **Waits & Timing**: AI tends to use hard-coded `waitForTimeout()` instead of proper Playwright waits.
   ```typescript
 What Claude suggested   // 
   await page.waitForTimeout(1000);
   
 What I fixed   // 
   await page.waitForNavigation({ waitUntil: 'networkidle' });
   ```

3. **Error Messages**: Claude sometimes writes generic error messages.
   ```typescript
 Generic   // 
   if (!response.success) throw new Error('Failed');
   
 Specific   // 
   if (!response.success) {
     throw new Error(`Failed to create user: ${JSON.stringify(response.errors)}`);
   }
   ```

4. **Test Data**: AI might hardcode test data instead of using factories.
   ```typescript
 Hardcoded   // 
   const testData = { email: 'test@example.com', ... };
   
 Factory   // 
   const testData = generateUserData();
   ```

---

## Phase 5: Import Path Issues

### Problem
After creating domain-driven structure, tests couldn't find modules:
```
Error: Cannot find module '../../src/core/env.config'
```

### Root Cause
- Tests in `tests/domains/content/articles.api.spec.ts` had imports like `from '../../src/core/...'`
- Correct path should be `from '../../../src/core/...'`

### Solution
Claude initially suggested using Playwright's `baseUrl` config, but the real issue was module resolution. Fixed by:
1. Using correct relative paths
2. Configuring `tsconfig.json` path aliases
3. Testing with `npx tsc --noEmit` to verify paths before running

### Learning
AI can suggest valid solutions but might miss filesystem structure details. Manual verification of import paths essential.

---


## Example: How an Agent Would Extend This

**Given** the existing framework and this instruction:

> Add a test for updating user profile (bio and image)

**An agent would**:
1. Find `tests/domains/identity/auth.api.spec.ts` (pattern matching)
2. See the test structure and fixtures
3. Import `{ test, expect }` from fixtures
4. Import `generateUserData()` from factories
5. Write:
```typescript
test('should update user profile', async ({ authenticatedRequest, testUser }) => {
  const updatedBio = 'Senior QA Engineer';
  const response = await authenticatedRequest.put('/user', {
    user: { bio: updatedBio, image: 'https://example.com/photo.jpg' }
  });
  
  expect(response.success).toBe(true);
  expect(response.data?.user?.bio).toBe(updatedBio);
});
```

**This works** because:
-  Follows established test pattern
-  Uses proper fixtures
-  Proper assertion structure
-  No DOM selectors (API test)
-  Clear test name describes intent

---

