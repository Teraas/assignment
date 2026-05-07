/**
 * Identity Domain Tests - Login UI Tests
 * 
 * Tests user login flow via UI:
 * - Navigate to login page
 * - Fill and submit login form
 * - Verify error handling
 */

import { test, expect } from '../../fixtures/auth.fixture';
import { LoginPageObject } from '../../../src/domains/identity/pages/LoginPageObject';
import { FeedPageObject } from '../../../src/domains/content/pages/FeedPageObject';
import { generateUserData } from '../../fixtures/data-factory';

test.describe('Identity Domain: Login UI', () => {
  /**
   * Test: User can login via UI form with valid credentials.
   * 
   * Verifies complete login flow: navigate to form, fill fields, submit,
   * and navigate to feed page.
   */
  test('should successfully login with valid credentials via UI', async ({
    authenticatedRequest,
    testUser,
    unauthenticatedPage: page,
  }) => {
    const loginPage = new LoginPageObject(page);
    const feedPage = new FeedPageObject(page);

    // Navigate to login
    await loginPage.navigateToLoginPage();
    expect(await loginPage.isLoginPageLoaded()).toBe(true);

    // Perform login
    await loginPage.performCompleteLoginFlow(testUser.email, testUser.password);
    await loginPage.waitForNavigationToFeedPage();

    // Verify logged in
    expect(await feedPage.isUserLoggedIn()).toBe(true);
  });

  /**
   * Test: Login fails with incorrect password and shows error.
   * 
   * Verifies error message is displayed on failed login.
   */
  test('should display error message when login fails with wrong password', async ({
    unauthenticatedPage: page,
  }) => {
    // Create a user first via direct API
    const userData = generateUserData();
    const createResponse = await fetch(`http://localhost:3000/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: userData }),
    });
    expect(createResponse.ok).toBe(true);

    const loginPage = new LoginPageObject(page);

    // Navigate and attempt login with wrong password
    await loginPage.navigateToLoginPage();
    await loginPage.performCompleteLoginFlow(userData.email, 'WrongPassword');
    await page.waitForLoadState('networkidle');

    // Verify error is shown
    expect(await loginPage.isErrorMessageDisplayed()).toBe(true);
  });

  /**
   * Test: User can navigate from login to signup page.
   * 
   * Verifies navigation link works between authentication pages.
   */
  test('should navigate to signup page from login page', async ({
    unauthenticatedPage: page,
  }) => {
    const loginPage = new LoginPageObject(page);

    await loginPage.navigateToLoginPage();
    await loginPage.clickSignUpLink();

    // Verify on signup page
    expect(page.url()).toContain('/#/register');
  });

  /**
   * Test: Login form requires both email and password.
   * 
   * Verifies form validation by checking empty submission handling.
   */
  test('should not allow login without email and password', async ({
    unauthenticatedPage: page,
  }) => {
    const loginPage = new LoginPageObject(page);

    await loginPage.navigateToLoginPage();
    await loginPage.clickSignInButton(); // Submit without filling
    
    // Should still be on login page
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/#/login');
  });
});
