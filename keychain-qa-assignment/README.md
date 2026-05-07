# Conduit Test Framework - Agentic-First QA Suite

A production-ready, domain-driven test framework for the [Conduit](https://github.com/cirosantilli/node-express-sequelize-realworld-example-app) blogging platform, built specifically to support AI coding agents (Claude Code, Copilot) in contributing tests and page objects.


## Architecture

This framework implements **6 key architectural decisions** to support agentic contribution:

1. **Domain-Driven Directory Segregation** - Code organized by feature (identity, content, social) not type, limiting agent context window
2. **Agentic-First Naming** - Methods use verbose, intent-based names (e.g., `clickSignInButton()` not `click()`)
3. **Domain-Specific API Clients** -  HTTP requests, headers, auth, error handling
4. **Fixture-Based Authentication** - Shared Playwright fixtures create test users automatically
5. **Page Object Model** - UI interactions encapsulated with descriptive method names
6. **Test Data Factories** - Consistent, reproducible test data generation

## Framework Structure

```
src/core/                    # Shared infrastructure
 ├─ api-client.ts          # Base API client (get/post/put/delete)
 └─ env.config.ts          # Configuration & endpoints

src/domains/                # Feature domains (team-scoped, no conflicts)
 ├─ identity/
 │  ├─ api/
 │  │  └─ IdentityApiClient.ts     # registerUser, loginUser, getCurrentUser
 │  └─ pages/
 │     └─ LoginPageObject.ts       # fillEmailInputField, clickSignInButton, etc.
 │
 ├─ content/
 │  ├─ api/
 │  │  └─ ArticleApiClient.ts      # createArticle, listArticles, updateArticle, etc.
 │  └─ pages/
 │     ├─ EditorPageObject.ts
 │     ├─ ArticlePageObject.ts
 │     └─ FeedPageObject.ts
 │
 └─ social/
    ├─ api/
    │  └─ SocialApiClient.ts        # addComment, favoriteArticle, followUser, etc.
    └─ pages/
       └─ (Ready for extension)

tests/fixtures/            # Shared test utilities
 ├─ auth.fixture.ts        # Automatic auth setup with domain clients
 └─ data-factory.ts        # Test data generation

tests/domains/             # Tests organized by domain
 ├─ identity/              # Auth tests (API + UI)
 ├─ content/               # Article tests (API + UI)
 ├─ social/                # Interaction tests (API)
 └─ e2e/                   # End-to-end tests
```

**Key Architecture Principles:**
- ✅ **Domain-Driven**: Code organized by feature, not by type
- ✅ **API Clients Mirror Pages**: Both domain-specific, typed, semantic
- ✅ **Scalable to 100+ Services**: Each domain managed independently, no merge conflicts
- ✅ **Agent-Friendly**: Clear patterns for agents to discover and extend

## How to Extend (for AI Agents)

### Add a New Test
Agents follow the established pattern in existing test files:

```typescript
import { test, expect } from '../../fixtures/auth.fixture';
import { FeedPageObject } from '../../../src/domains/content/pages/FeedPageObject';
import { generateArticleData } from '../../fixtures/data-factory';

test.describe('Content Domain: Articles', () => {
  test('should new feature works', async ({ authenticatedRequest, page, testUser }) => {
    const feedPage = new FeedPageObject(page);
    const data = generateArticleData({ title: 'Custom Title' });
    
    // Test code here
  });
});
```

### Add a New Page Object Method
Page objects use verbose, intent-based naming:

```typescript
// In LoginPageObject.ts
async fillEmailInputField(email: string): Promise<void> {
  await this.page.fill('input[type="email"]', email);
}

async clickRememberMeCheckbox(): Promise<void> {
  await this.page.click('input[type="checkbox"]');
}
```


## Configuration

Edit `src/core/env.config.ts` to customize:

```typescript
export const ENV = {
  BASE_URL: process.env.BASE_URL || 'http://localhost:4101',
  API_URL: process.env.API_URL || 'http://localhost:3000/api',
  // ... more config
};
```

Or use environment variables:
```bash
BASE_URL=http://localhost:4101 API_URL=http://localhost:3000/api npm test
```

## Key Decisions Documented

- **[DECISIONS.md](./DECISIONS.md)** - 6 architectural choices with rationale
- **[AI_USAGE.md](./AI_USAGE.md)** - How AI was used during implementation
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Deep dive into framework design

## Agentic Design Principles

### 1. Discoverable APIs
- Page objects list all available methods with JSDoc
- Test files show usage patterns agents can copy
- Consistent naming makes predictions possible

### 2. Type Safety
- Full TypeScript with strict mode
- All responses typed (ApiResponse<T>, TestUser, etc.)
- Agents get IDE autocomplete - reduces errors

### 3. Composable Fixtures
- Tests inherit fixtures: `async ({ page, authenticatedRequest, testUser }) => {}`
- Fixtures handle setup/teardown transparently
- Agents don't need to understand Playwright lifecycle

### 4. Factory Pattern for Data
- `generateUserData()`, `generateArticleData()`, etc.
- Every call creates unique, isolated test data
- Agents see the pattern and extend naturally

### 5. Clear Separation of Concerns
- Domains are independent - agents work on one domain at a time
- Core utilities used by all domains
- APIs exposed through consistent methods

## Running Tests

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific test file
npx playwright test tests/domains/identity/auth.api.spec.ts

# Run in UI mode (visual debugging)
npx playwright test --ui

# Run tests with headed browser (see browser actions)
npx playwright test --headed

# View test report
npx playwright show-report
```

## Framework Features

### ✅ Implemented
- Domain-driven structure supporting team modularity
- Agentic-first naming and JSDoc throughout
- Domain-Specific API Clients with auth support
- Fixture-based authentication (automatic user creation)
- Page Object Model with verbose intent-based methods
- Test data factories for reproducibility
- TypeScript with strict type checking
- 30 tests across 4 domains (18 passing)
- End-to-end user journey tests
- Both API and UI test coverage


## How AI Agents Contribute

### Adding a New Test
```typescript
import { test, expect } from '../../fixtures/auth.fixture';
import { FeedPageObject } from '../../../src/domains/content/pages/FeedPageObject';
import { generateArticleData } from '../../fixtures/data-factory';

test('should new feature works', async ({ authenticatedRequest, page }) => {
  const feedPage = new FeedPageObject(page);
  const data = generateArticleData({ title: 'My Custom Title' });
  
  // Agent sees the pattern and extends naturally
  await feedPage.navigateToFeedPage();
  // ... rest of test
});
```

### Adding a New Page Object Method
```typescript
// Agent sees existing methods and understands the pattern
async addReactionToComment(id: string, reaction: string): Promise<void> {
  await this.page.click(`button[data-comment-id="${id}"][data-reaction="${reaction}"]`);
}
```
### Add a New API Test
API tests use domain-specific clients for better scalability and type safety:

**Option 1: Using Domain-Specific Client (Recommended)**
```typescript
test('should create article', async ({ articleClient }) => {
  const response = await articleClient.createArticle({
    title: 'Test Article',
    description: 'Test description',
    body: 'Test body'
  });
  
  expect(response.success).toBe(true);
  expect(response.data?.article?.slug).toBeDefined();
});
```

**Option 2: Using Generic Client (Fallback)**
```typescript
test('should create article', async ({ authenticatedRequest }) => {
  const response = await authenticatedRequest.post('/articles', {
    article: generateArticleData()
  });
  
  expect(response.success).toBe(true);
  expect(response.data?.article?.slug).toBeDefined();
});
```

**Why Domain-Specific Clients?**
- ✅ Type-safe responses (ArticleResponse)
- ✅ Clear semantics (`createArticle` vs `post('/articles')`)
- ✅ IDE autocomplete shows all operations
- ✅ Scales to 100+ services (each domain independent)


## Key Success Metrics

✅ **Framework is agentic-first**: Clear naming, JSDoc, pattern-based design  
✅ **Modular**: Domains are independent, teams won't conflict  
✅ **Type-safe**: TypeScript strict mode prevents bugs  
✅ **Maintainable**: Centralized API client, factories, page objects  
✅ **Executable**: 30 tests running against live app  
✅ **Documented**: This architecture document + inline JSDoc  


## Test Coverage

**25+ tests** across 4 domains:
Using the App : react-redux-realworld-example-app
API : https://github.com/cirosantilli/node-express-sequelize-realworld-example-app
Database : sqllite

### Content Domain (10 tests)
- Article CRUD operations (API) - Working
- Article editor and viewer (UI) - Working

### Identity Domain (9 tests)
- User registration and login
- Token persistence
- Error handling
- UI form interactions

### Social Domain (7 tests)
- Comments (add, list, delete)
- Favorites (favorite/unfavorite)
- Follows (follow/unfollow)

### End-to-End (2 tests)
 favorite
- Multi-user interactions

**Status**: 18 passing, 12 with UI selector fixes needed 

## Summary

| Decision | Why Agentic | Prevents |
|----------|-----------|----------|
| Domain-driven | Limited context, pattern discovery | Hallucinations, overwhelming scope |
| Verbose naming | Semantic understanding | DOM inspection by agent |
| Centralized API client | Single extension point | Fragmented implementations |
| Fixture-based auth | Transparent, no boilerplate | Manual setup code, auth errors |
| Page Objects | Encapsulated, readable | Brittle selector-based tests |
| Test factories | Data isolation, pattern-based | Flaky state-dependent tests |

**Result**: Framework that AI agents can extend confidently within minutes.

