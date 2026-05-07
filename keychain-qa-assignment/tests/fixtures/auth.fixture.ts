/**
 * Test fixtures for Playwright tests.
 * 
 * Provides shared setup/teardown and fixture context for all tests.
 * Handles authentication via API client and provides test user context.
 * 
 * Usage:
 *   test('my test', async ({ page, authenticatedRequest, testUser }) => { ... })
 */

import { test as base, expect, Page } from '@playwright/test';
import { ApiClient } from '../../src/core/api-client';
import { ENV } from '../../src/core/env.config';

export interface TestUser {
  email: string;
  username: string;
  password: string;
  token: string;
}

/**
 * Extended test fixture with authentication context.
 * 
 * Provides pre-configured fixtures:
 * - authenticatedRequest: API request context with auth token
 * - testUser: Newly created test user with token
 * - unauthenticatedPage: Browser page without auth
 */
export const test = base.extend<{
  authenticatedRequest: ApiClient;
  testUser: TestUser;
  unauthenticatedPage: Page;
}>({
  /**
   * Provide authenticated API client for test.
   * 
   * Creates a new test user and sets token in API client.
   * Stores JWT token in localStorage as 'jwt' which Conduit app expects.
   * When page loads, Redux middleware reads jwt from localStorage and:
   * - Initializes logged-in state
   * - Sets Authorization header for API requests
   * Automatically cleaned up after test.
   */
  authenticatedRequest: async ({ page }, use) => {
    const client = new ApiClient();
    const testUser = await createTestUser(client);
    client.setAuthToken(testUser.token);
    
    // Navigate to app first so localStorage is accessible
    await page.goto(ENV.BASE_URL);
    
    // Store JWT in localStorage with key 'jwt' as Conduit Redux expects
    // Redux middleware will read this on app load and set Authorization headers
    await page.evaluate((token) => {
      localStorage.setItem('jwt', token);
    }, testUser.token);
    
    // Reload page so Redux initializes with token from localStorage
    await page.reload({ waitUntil: 'networkidle' });
    
    await use(client);
    // Cleanup happens automatically
  },

  /**
   * Provide test user with token for direct assertions.
   * 
   * Returns user data created during authenticatedRequest fixture.
   */
  testUser: async ({ authenticatedRequest }, use) => {
    const client = authenticatedRequest;
    const token = client.getAuthToken();

    if (!token) {
      throw new Error('Test user not authenticated');
    }

    const response = await client.get<{ user: TestUser }>(ENV.ENDPOINTS.CURRENT_USER);

    if (!response.success || !response.data?.user) {
      throw new Error('Failed to fetch current user');
    }

    const user: TestUser = {
      ...response.data.user,
      token,
      password: '', // Not available from API
    };

    await use(user);
  },

  /**
   * Provide regular page without authentication for testing login flows.
   */
  unauthenticatedPage: async ({ page }, use) => {
    await page.context().clearCookies();
    await use(page);
  },
});

/**
 * Create a new test user via API.
 * 
 * Registers a user with unique email/username and returns the full response
 * including authentication token.
 * 
 * @param client - API client instance
 * @returns User object with credentials and token
 * @throws If registration fails
 */
async function createTestUser(client: ApiClient): Promise<TestUser> {
  const userData = {
    email: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}@example.com`,
    username: `user_${Date.now()}`,
    password: 'Test@Password123',
  };

  const response = await client.post<{ user: TestUser }>(ENV.ENDPOINTS.USERS, {
    user: userData,
  });

  if (!response.success || !response.data?.user) {
    throw new Error(`Failed to create test user: ${JSON.stringify(response.errors)}`);
  }

  return response.data.user;
}

export { expect };

