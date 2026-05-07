/**
 * Identity Domain - Login Page Object
 * 
 * Encapsulates all interactions with the login page /#/login.
 * Provides methods for filling form fields, submitting, and verifying state.
 * 
 * Agentic-first design: methods use verbose intent-based naming and include
 * JSDoc describing each action so AI agents understand the purpose without
 * needing to inspect the DOM directly.
 */

import { Page } from '@playwright/test';
import { ENV } from '../../../core/env.config';

/**
 * Page Object for Conduit login page.
 * 
 * Manages all user interactions with /#/login including form input,
 * submission, error handling, and navigation verification.
 * 
 * @example
 * const loginPage = new LoginPageObject(page);
 * await loginPage.navigateToLoginPage();
 * await loginPage.fillEmailInputField('user@example.com');
 * await loginPage.fillPasswordInputField('password123');
 * await loginPage.clickSignInButton();
 * await loginPage.waitForNavigationToFeedPage();
 */
export class LoginPageObject {
  /**
   * Initialize login page object.
   * 
   * @param page - Playwright page instance
   */
  constructor(private page: Page) {}

  /**
   * Navigate to the login page.
   * 
   * Loads /login and waits for page to be interactive.
   */
  async navigateToLoginPage(): Promise<void> {
    await this.page.goto(`${ENV.BASE_URL}/login`, { waitUntil: 'networkidle' });
  }

  /**
   * Check if login page is loaded and ready for interaction.
   * 
   * Verifies presence of key page elements (heading, form fields).
   * 
   * @returns true if page is loaded, false otherwise
   */
  async isLoginPageLoaded(): Promise<boolean> {
    const headingVisible = await this.page.isVisible('h1:has-text("Sign in")');
    const emailFieldVisible = await this.page.isVisible('input[type="email"]');
    return headingVisible && emailFieldVisible;
  }

  /**
   * Fill email input field with provided email address.
   * 
   * @param email - Email address to enter
   */
  async fillEmailInputField(email: string): Promise<void> {
    await this.page.fill('input[type="email"]', email);
  }

  /**
   * Fill password input field with provided password.
   * 
   * @param password - Password to enter
   */
  async fillPasswordInputField(password: string): Promise<void> {
    await this.page.fill('input[type="password"]', password);
  }

  /**
   * Click the sign-in button to submit login form.
   * 
   * Does not wait for navigation - use waitForNavigationToFeedPage() for that.
   */
  async clickSignInButton(): Promise<void> {
    await this.page.click('button:has-text("Sign in")');
  }

  /**
   * Complete full login flow: fill form and submit.
   * 
   * Combines email field, password field, and button click in one call.
   * Does not wait for page navigation - caller should handle navigation wait.
   * 
   * @param email - User email address
   * @param password - User password
   */
  async performCompleteLoginFlow(email: string, password: string): Promise<void> {
    await this.fillEmailInputField(email);
    await this.fillPasswordInputField(password);
    await this.clickSignInButton();
  }

  /**
   * Wait for navigation to feed page after successful login.
   * 
   * Waits for page to navigate away from login and network to settle.
   * Useful after clickSignInButton() to ensure navigation completes.
   */
  async waitForNavigationToFeedPage(): Promise<void> {
    await this.page.waitForNavigation({ waitUntil: 'networkidle' });
  }

  /**
   * Check if login error message is displayed.
   * 
   * Verifies presence of error message element (indicates failed login).
   * 
   * @returns true if error message visible, false otherwise
   */
  async isErrorMessageDisplayed(): Promise<boolean> {
    const errorElement = this.page.locator('ul.error-messages').first();
    return await errorElement.isVisible().catch(() => false);
  }

  /**
   * Get login error message text.
   * 
   * Retrieves error message displayed after failed login attempt.
   * 
   * @returns Error message text or null if not visible
   */
  async getErrorMessageText(): Promise<string | null> {
    const element = await this.page.locator('ul.error-messages').first();
    return element.isVisible() ? await element.textContent() : null;
  }

  /**
   * Click link to navigate to signup page.
   * 
   * Handles navigation from login to registration page.
   */
  async clickSignUpLink(): Promise<void> {
    await this.page.click('a:has-text("Need an account?")');
  }
}
