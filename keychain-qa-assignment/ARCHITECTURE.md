# Test Framework Structure & Implementation

## Architecture Overview

This test framework implements a **domain-driven, agentic-first architecture** for testing the Conduit blogging platform. The structure is designed specifically to support AI coding agents (Claude Code, Copilot) in contributing tests and page objects while minimizing hallucinations and maximizing code reusability.

# Domain-Driven API Clients Architecture
## Problem This Solves

For organizations with hundreds of services, a single generic `ApiClient` **doesn't scale**:

### Mirror Page Object Pattern
```
Pages (UI)                      APIs (HTTP)
├── LoginPageObject             ├── IdentityApiClient
│   ├── fillEmailInputField     │   ├── registerUser
│   ├── clickSignInButton       │   ├── loginUser
│   └── isErrorMessageDisplayed │   └── getCurrentUser
│
├── EditorPageObject            ├── ArticleApiClient
│   ├── fillTitleInputField     │   ├── createArticle
│   ├── createArticleWithFlow   │   ├── updateArticle
│   └── clickPublishButton      │   └── deleteArticle
│
└── FeedPageObject              └── SocialApiClient
    ├── navigateToFeedPage          ├── addComment
    ├── clickArticleInFeed          ├── favoriteArticle
    └── getArticleCount             └── followUser
```

## Directory Structure

```
keychain-qa-assignment/
├── src/
│   ├── core/
│   │   ├── api-client.ts          # Centralized API client with auth support. Can extend for grpc,GQL or any protocol.
│   │   └── env.config.ts          # Configuration & environment variables
│   │
│   └── domains/                   # Domain-driven organization
│       ├── identity/              # User authentication domain
│       │   └── pages/
│       │       ├── LoginPageObject.ts
│       │       └── SignupPageObject.ts
│       │   └── api/
│       │       ├── IdentityApiClient.ts
│       │
│       ├── content/               # Article management domain
│       │   └── pages/
│       │       ├── EditorPageObject.ts
│       │       ├── ArticlePageObject.ts
│       │       └── FeedPageObject.ts
│       │   └── api/
│       │       ├── ArticleApiClient.ts
│       │
│       └── social/                # Comments, favorites, follows
│
├── tests/
│   ├── fixtures/
│   │   ├── auth.fixture.ts        # Shared test setup & fixtures
│   │   └── data-factory.ts        # Test data generation
│   │
│   ├── domains/
│   │   ├── identity/
│   │   │   ├── auth.api.spec.ts       # Registration, login, auth flows
│   │   │   └── login.ui.spec.ts       # Login UI tests
│   │   │
│   │   ├── content/
│   │   │   ├── articles.api.spec.ts   # Article CRUD operations
│   │   │   └── articles.ui.spec.ts    # Article UI workflows
│   │   │
│   │   └── social/
│   │       └── interactions.api.spec.ts # Comments, favorites, follows
│   │
│   └── e2e/
│       └── end-to-end.spec.ts     # Full user journey tests
│
├── playwright.config.ts            # Playwright configuration
├── tsconfig.json                   # TypeScript configuration
└── package.json
```

## Key Architectural Decisions

### 1. Domain-Driven Directory Segregation
- **Decision**: Organized code by feature domains (identity, content, social) rather than by type (pages, tests, api)
- **Why**: 
  - Supports team modularity - multiple teams work on different domains without conflicts
  - Limits "context window" for AI agents - they focus on relevant page objects & tests for one domain
  - Reduces hallucinations when agents contribute new code
  - Easy for agents to discover patterns within a domain
- **Rejected**: Flat Page Object Model with all pages in global folder
- **Constraint to flip**: Single-engineer project where cross-domain code sharing is more valuable than isolation

### 2. Agentic-First Method Naming & JSDoc
- **Decision**: All framework methods use verbose, intent-based naming with mandatory JSDoc descriptions
- **Examples**:
  - `fillEmailInputField(email)` instead of `fillInput(selector, value)`
  - `clickSignInButton()` instead of `click('button')`
  - `navigateToLoginPage()` instead of `goto('/login')`
- **Why**: AI agents understand semantic meaning. Clear method names eliminate need for agents to inspect DOM or read implementation
- **Rejected**: Highly abstracted helper functions requiring internal knowledge to understand
- **Constraint to flip**: If framework was strictly for human use optimizing for brevity

### 3. Domain-Specific API Clients (Extending Base Client)
- **Decision**: Base `src/core/api-client.ts` with domain-specific clients (IdentityApiClient, ArticleApiClient, SocialApiClient) that extend it
- **Structure**:
  ```
  src/core/api-client.ts (base, ~160 lines)
  ├─ get<T>(path): Promise<ApiResponse<T>>
  ├─ post<T>(path, body): Promise<ApiResponse<T>>
  ├─ put<T>(path, body): Promise<ApiResponse<T>>
  └─ delete<T>(path): Promise<ApiResponse<T>>
  
  src/domains/identity/api/IdentityApiClient.ts → extends ApiClient
  ├─ registerUser(userData): Promise<ApiResponse<UserResponse>>
  ├─ loginUser(email, password): Promise<ApiResponse<UserResponse>>
  └─ getCurrentUser(): Promise<ApiResponse<UserResponse>>
  
  src/domains/content/api/ArticleApiClient.ts → extends ApiClient
  ├─ createArticle(data): Promise<ApiResponse<ArticleResponse>>
  ├─ listArticles(query): Promise<ApiResponse<ArticlesListResponse>>
  └─ updateArticle(slug, updates): Promise<ApiResponse<ArticleResponse>>
  ```
- **Why**:
  - **Scalability**: At 1-3 services, generic client works. At 100+ services, domain clients essential (each team owns theirs independently)
  - **Type Safety**: Typed methods (registerUser) vs generic post('/users')
  - **Discoverability**: IDE autocomplete shows all operations for a domain
  - **Pattern Mirror**: Mirrors Page Object structure - both are domain-specific, semantic, typed
  - **Team Ownership**: No merge conflicts; each domain managed independently
  - **Agent Patterns**: Agents see 3 examples and can reliably extend to new services
- **Rejected**: Single generic ApiClient with raw endpoint strings everywhere (doesn't scale beyond 5-10 services)
- **Constraint to flip**: If this framework served a single-service micro-tool with only 1-2 engineers

### 4. Fixture-Based Authentication
- **Decision**: Custom Playwright fixtures create authenticated test users automatically
- **Why**:
  - Fulfills  requirement: "shared auth and data management patterns"
  - Tests inherit `authenticatedRequest` and `testUser` automatically
  - Each test gets fresh user (data isolation & no flaky shared state)
  - No need for beforeEach hooks in tests - cleaner test code
  - Avoids UI-based login for every test (faster execution)
- **Rejected**: Logging in via UI in beforeEach for every test
- **Constraint to flip**: If auth flow itself (MFA, SSO redirects) was primary test target

### 5. Separation of Concerns: API vs UI Tests
- **Decision**: Clear split - API tests use direct HTTP, UI tests use Playwright page objects
- **Why**:
  - API tests are fast, deterministic, easier for agents to extend
  - UI tests verify actual user experience
  - Both required by requirement
  - Different test data strategies work better for each
- **Rejected**: Everything via UI (slower, less reliable)
- **Constraint to flip**: If UI testing was the only deliverable

### 6. Page Object Model with Verbose Selectors
- **Decision**: Page Objects encapsulate all UI selectors and interactions with descriptive method names
- **Structure**:
  ```typescript
  async clickSignInButton(): Promise<void> {
    await this.page.click('button:has-text("Sign in")');
  }
  ```
- **Why**:
  - Single place to update selectors if UI changes
  - Agents see method names and understand intent without reading selectors
  - Easy for agents to add similar methods
  - Tests read like documentation
- **Rejected**: Direct selector references in tests (`page.click(...)`)
- **Constraint to flip**: If selectors were extremely simple or UI very stable