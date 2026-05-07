# Architecture Decisions - Agentic-First Test Framework

## 1. Domain-Driven Directory Segregation

**Decision**: Organized code by feature domains (identity, content, social) rather than by technical type (pages, tests, api)

**Structure**:
```
src/domains/identity/pages/   # All login/signup related
src/domains/content/pages/    # All article related
tests/domains/identity/       # All identity tests
tests/domains/content/        # All content tests
```

**Why**: 
- **Team Modularity**: Multiple product teams work on different domains without merge conflicts
- **Limited Context**: AI agents focus on relevant page objects and tests for one domain, reducing hallucinations
- **Pattern Discovery**: Agents naturally discover how to add tests in their domain by examining existing patterns
- **Scalability**: As framework grows, adding new domains doesn't require reorganizing existing code

**Rejected Alternative**: Flat Page Object Model
```
src/pages/LoginPageObject.ts
src/pages/EditorPageObject.ts
src/pages/FeedPageObject.ts
tests/auth.spec.ts
tests/articles.spec.ts
```
This forces agents to understand entire codebase - higher hallucination risk.

**Constraint to Flip**: If this were a single-purpose micro-tool with one engineer, flat structure would be fine.

---

## 2. Agentic-First Verbose Method Naming & JSDoc

**Decision**: All framework methods use intent-based names with mandatory JSDoc descriptions

**Pattern**:
```typescript
//  Good - Agentic-first
async clickSignInButton(): Promise<void> {
  /**
   * Click the sign-in button to submit login form.
   */
  await this.page.click('button:has-text("Sign in")');
}

 Bad - Requires DOM knowledge// 
async clickButton(selector: string): Promise<void> {
  await this.page.click(selector);
}

//  Good - Clear what it does
async fillEmailInputField(email: string): Promise<void> {
  /**
   * Fill email input field with provided email address.
   */
  await this.page.fill('input[type="email"]', email);
}

 Bad - Agent must understand internally// 
async fillInput(field: string, value: string): Promise<void> {
  await this.page.fill(field, value);
}
```

**Why**:
- **Semantic Understanding**: Agents understand `clickSignInButton()` by the name alone
- **No DOM Inspection**: Agent doesn't need to read page source or inspect selectors
- **IDE Autocomplete**: Agents see available methods with descriptions in IDE
- **Self-Documenting**: Tests read like documentation (tests are specifications)

**Examples of Good Names**:
- `navigateToLoginPage()` not `goto('/login')`
- `performCompleteLoginFlow()` not `fillAndSubmit()`
- `waitForNavigationToFeedPage()` not `waitForNav()`
- `clickFavoriteButton()` not `clickBtn()`

**Rejected Alternative**: Highly abstracted helpers
```typescript
// Requires understanding implementation
async do(action: string, selector: string, value?: string) {
  if (action === 'click') await this.page.click(selector);
  if (action === 'fill') await this.page.fill(selector, value);
}
```

**Constraint to Flip**: If framework was strictly for humans and minimizing lines of code was the primary goal.

---

## 3. Centralized Single-Source API Client

**Decision**: All API requests go through `src/core/api-client.ts` - a single client class

**Structure**:
```typescript
// Single source of truth for HTTP behavior
export class ApiClient {
  private authToken: string | null = null;
  
  async request<T>(path: string, config: ApiRequestConfig): Promise<ApiResponse<T>> {
    // Centralized: headers, auth, error handling, timeouts
  }
  
  async get<T>(path: string): Promise<ApiResponse<T>> { ... }
  async post<T>(path: string, body: unknown): Promise<ApiResponse<T>> { ... }
  async put<T>(path: string, body: unknown): Promise<ApiResponse<T>> { ... }
  async delete<T>(path: string): Promise<ApiResponse<T>> { ... }
}

// Used by all tests
test('should work', async ({ authenticatedRequest }) => {
  const response = await authenticatedRequest.post('/articles', { /* ... */ });
});
```

**Why**:
- **Consistency**: Headers, auth tokens, error handling standardized everywhere
- **Maintainability**: Change headers in one place - affects all tests
- **Extension Point**: Agents add new methods to ApiClient (e.g., `patchArticle()`)
- **Prevents Fragmentation**: No random `fetch()` or `axios()` calls scattered in tests

**Rejected Alternative**: Individual API calls
```typescript
// Fragmented - agents would write this pattern
test('should work', async () => {
  const response = await fetch('http://localhost:3000/api/articles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ... })
  });
});
// This pattern repeats everywhere - inconsistent headers, auth handling, errors
```

**Constraint to Flip**: If different services used incompatible protocols (REST vs gRPC).

---

## 4. Fixture-Based Automatic Authentication

**Decision**: Custom Playwright fixtures handle authentication setup automatically

**Implementation**:
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
  
  testUser: async ({ authenticatedRequest }, use) => {
    // Returns user data automatically
    await use(user);
  }
});

// Tests inherit fixtures transparently
test('should work', async ({ authenticatedRequest, testUser, page }) => {
  // Fixtures already set up:
  // - User created
  // - Token set in API client
  // - Page cleared of cookies
  // NO SETUP CODE NEEDED IN TEST
});
```

**Why**:
- **Fulfills requirement**: "Shared auth and data management patterns"
- **No Duplicate Setup**: Each test gets fresh user without beforeEach hooks
- **Data Isolation**: Tests don't interfere with each other
- **Faster**: No UI-based login for every test (API-based setup)
- **Clean Tests**: No boilerplate code, reads like business logic

**Test Clarity**:
```typescript
//  Clean - fixture handles setup
test('should create article', async ({ authenticatedRequest }) => {
  const response = await authenticatedRequest.post('/articles', {
    article: generateArticleData()
  });
  expect(response.success).toBe(true);
});

 Messy - manual setup// 
test('should create article', async ({ page }) => {
  const user = generateUserData();
  await fetch('http://localhost:3000/api/users', { ... });
  // 20 lines of setup code
  // Finally test 1 line of actual behavior
});
```

**Rejected Alternative**: beforeEach UI-based login
```typescript
test.beforeEach(async ({ page }) => {
  await page.goto('/#/login');
  await page.fill('input[type="email"]', user.email);
  await page.fill('input[type="password"]', user.password);
  await page.click('button');
  // Slow and fragile
});
```

**Constraint to Flip**: If authentication flow itself (MFA, complex SSO) was the primary test target.

---

## 5. Page Object Model with Encapsulated Selectors

**Decision**: All UI selectors/locators/xpaths hidden behind descriptive method names in Page Objects

**Structure**:
```typescript
export class LoginPageObject {
  constructor(private page: Page) {}
  
  async fillEmailInputField(email: string): Promise<void> {
    // Selector hidden, never exposed to tests
    await this.page.fill('input[type="email"]', email);
  }
  
  async clickSignInButton(): Promise<void> {
    await this.page.click('button:has-text("Sign in")');
  }
}

// Tests use page objects, never raw selectors
test('should login', async ({ page }) => {
  const loginPage = new LoginPageObject(page);
  await loginPage.fillEmailInputField('user@example.com');
  await loginPage.fillPasswordInputField('password');
  await loginPage.clickSignInButton();
  // Agents see the pattern and add methods similarly
});
```

**Why**:
- **Single Update Point**: UI changes? Update selector in one place
- **Test Readability**: Tests describe behavior, not DOM details
- **Discoverability**: Agents see available page methods in IDE
- **Maintenance**: Old selectors break in one place, not 50 tests

**Rejected Alternative**: Selectors in tests
```typescript
// Fragile - if selector changes, 50 tests break
test('should login', async ({ page }) => {
  await page.fill('input[type="email"]', email); // Duplicate in 20 tests
  await page.click('button.primary'); // Fragile selector
});
```

**Constraint to Flip**: If UI was extremely stable and tests needed to be as concise as possible.

---

## 6. Test Data Factories for Reproducibility

**Decision**: Use factory functions to generate consistent test data. Or us *TestDataService* if available.

**Implementation**:
```typescript
export function generateUserData(overrides?: Partial<UserData>) {
  const timestamp = Date.now();
  return {
    email: `user_${timestamp}@example.com`,
    username: `user_${timestamp}`,
    password: 'Test@Password123',
    ...overrides
  };
}

// Every call generates unique data
test('multiple users can login', async () => {
  const user1 = generateUserData();
  const user2 = generateUserData();
  
  // user1.email !== user2.email (timestamp ensures uniqueness)
});

// Agents extend naturally
const userWithBio = generateUserData({ bio: 'Senior Engineer' });
```

**Why**:
- **Data Isolation**: Each test has unique data, no flaky state sharing
- **Reproducibility**: Same test data generation across runs
- **Easy Overrides**: Agents easily customize with `{ title: 'Custom' }`
- **Pattern Discovery**: Agents see how to extend

**Test Independence**:
```typescript
//  Each test fully independent
test('user1', async () => {
  await createUser(generateUserData());
});

test('user2', async () => {
  await createUser(generateUserData()); // Different user
});
// Both pass even if run in any order

 Tests depend on each other (fragile)// 
let globalUser = { ... };
test('create', async () => {
  globalUser = await createUser({ ... });
});

test('update', async () => {
  // Only works if 'create' ran first!
  await updateUser(globalUser);
});
```

**Rejected Alternative**: Static test data
```typescript
// Shared global state causes flakiness
const TEST_USER = { email: 'test@example.com', ... };

test('test1', async () => {
  await createUser(TEST_USER); // Might already exist!
});

test('test2', async () => {
  await createUser(TEST_USER); // Fails - duplicate email
});
```

**Constraint to Flip**: If tests deliberately needed shared state for performance.

---

## 7. Domain-Specific API Clients (Mirror Page Objects Pattern)

**Decision**: Created domain-specific API clients (IdentityApiClient, ArticleApiClient, SocialApiClient) that extend a shared base ApiClient, mirroring the Page Object structure.

**Pattern**:
```typescript
// Pages (UI Testing)                  APIs (HTTP Testing)
// src/domains/identity/pages/         src/domains/identity/api/
// └─ LoginPageObject.ts               └─ IdentityApiClient.ts
//    ├─ fillEmailInputField()            ├─ registerUser()
//    ├─ clickSignInButton()              ├─ loginUser()
//    └─ performCompleteLoginFlow()       └─ getCurrentUser()

// Both semantic, typed, domain-specific
```

**Why**:
- **Scalability to 100+ Services**: At enterprise scale, a single generic ApiClient becomes a bottleneck. Domain clients allow each team to own their service client independently.
- **Pattern Discovery**: Agents see 3 examples (Identity, Article, Social) and can reliably extend to any new service without hallucinations.
- **Type Safety & Discoverability**: IDE autocomplete shows all operations for a domain; tests don't need raw endpoint strings scattered everywhere.
- **Team Ownership**: No merge conflicts; each team manages their domain client independently.
- **Semantic Operations**: `socialClient.favoriteArticle(slug)` reads clearer than `apiClient.post('/articles/slug/favorite', {})`.

**Rejected Alternative**: Single generic ApiClient with raw endpoint strings
```typescript
// Generic approach - doesn't scale
test('favorite', async () => {
  await apiClient.post('/articles/slug/favorite', {}); // What is this?
});
```
At 100 services, this results in hundreds of raw endpoint strings scattered across tests with no ownership or discoverability.

**Constraint to Flip**: If this framework served a single-service micro-tool with only 1-2 engineers, generic client is sufficient. But for organizations with multiple teams and services, domain clients are essential.

**Implementation Example** - Agent Adding Notifications Service:

When prompted to add a new "Notifications" service, agent sees the pattern in existing clients and generates:

```typescript
// src/domains/notifications/api/NotificationApiClient.ts
import { ApiClient, ApiResponse } from '../../../core/api-client';

export interface NotificationSubscription {
  type: 'email' | 'sms' | 'push';
  channel: string;
}

export class NotificationApiClient extends ApiClient {
  /**
   * Subscribe to notification channel
   */
  async subscribe(subscription: NotificationSubscription): Promise<ApiResponse> {
    return this.post('/notifications/subscribe', subscription);
  }

  /**
   * Unsubscribe from notifications
   */
  async unsubscribe(type: string): Promise<ApiResponse> {
    return this.delete(`/notifications/unsubscribe?type=${type}`);
  }

  /**
   * Get user's notifications
   */
  async getNotifications(limit = 20): Promise<ApiResponse> {
    return this.get(`/notifications?limit=${limit}`);
  }
}
```

✅ Agent successfully extends pattern because structure is clear and discoverable

