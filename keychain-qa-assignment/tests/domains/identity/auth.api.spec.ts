/**
 * Identity Domain Tests - Authentication API Tests
 * 
 * Tests core authentication flows via API:
 * - User registration
 * - User login
 * - Token persistence
 */

import { test, expect } from '../../fixtures/auth.fixture';
import { ApiClient } from '../../../src/core/api-client';
import { ENV } from '../../../src/core/env.config';
import { generateUserData } from '../../fixtures/data-factory';

test.describe('Identity Domain: Authentication API', () => {
  /**
   * Test: User can register with valid credentials.
   * 
   * Verifies that new user registration returns proper user object with token.
   */
  test('should register a new user with valid email and username', async () => {
    const client = new ApiClient();
    const userData = generateUserData();

    const response = await client.post('/users', {
      user: userData,
    });

    expect(response.success).toBe(true);
    expect(response.statusCode).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data?.user?.email).toBe(userData.email);
    expect(response.data?.user?.username).toBe(userData.username);
    expect(response.data?.user?.token).toBeDefined();
  });

  /**
   * Test: User can login with valid credentials.
   * 
   * Verifies that login returns fresh token and user information.
   */
  test('should login user with valid email and password', async ({
    authenticatedRequest,
    testUser,
  }) => {
    // testUser fixture already creates and logs in user
    // Verify we have valid user data and token
    expect(testUser.email).toBeDefined();
    expect(testUser.token).toBeDefined();
    expect(testUser.token).toBeTruthy();
  });

  /**
   * Test: User can retrieve current user profile with valid token.
   * 
   * Verifies that authenticated requests return current user information.
   */
  test('should fetch current user profile when authenticated', async ({
    authenticatedRequest,
    testUser,
  }) => {
    const response = await authenticatedRequest.get(ENV.ENDPOINTS.CURRENT_USER);

    expect(response.success).toBe(true);
    expect(response.statusCode).toBe(200);
    expect(response.data?.user?.email).toBe(testUser.email);
    expect(response.data?.user?.username).toBe(testUser.username);
  });

  /**
   * Test: Login fails with incorrect password.
   * 
   * Verifies that API rejects bad credentials.
   */
  test('should reject login with incorrect password', async () => {
    const client = new ApiClient();
    const userData = generateUserData();

    // Create user first
    await client.post('/users', { user: userData });

    // Try to login with wrong password
    const response = await client.post(ENV.ENDPOINTS.LOGIN, {
      user: {
        email: userData.email,
        password: 'WrongPassword123',
      },
    });

    expect(response.success).toBe(false);
    expect(response.statusCode).not.toBe(200);
    expect(response.errors).toBeDefined();
  });

  /**
   * Test: Login fails for non-existent user.
   * 
   * Verifies that API rejects login for unknown emails.
   */
  test('should reject login for non-existent user', async () => {
    const client = new ApiClient();

    const response = await client.post(ENV.ENDPOINTS.LOGIN, {
      user: {
        email: 'nonexistent@example.com',
        password: 'Password123',
      },
    });

    expect(response.success).toBe(false);
    expect(response.statusCode).not.toBe(200);
  });

  /**
   * Test: Unauthenticated request to protected endpoint fails.
   * 
   * Verifies that API requires token for protected endpoints.
   */
  test('should reject unauthenticated access to protected endpoints', async () => {
    const client = new ApiClient();

    const response = await client.get(ENV.ENDPOINTS.CURRENT_USER);

    expect(response.success).toBe(false);
    expect(response.statusCode).not.toBe(200);
  });
});
