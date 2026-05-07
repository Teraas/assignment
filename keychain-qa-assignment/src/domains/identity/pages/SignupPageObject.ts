/**
 * Identity Domain - Signup Page Object
 * 
 * Encapsulates all interactions with the signup page /#/register.
 */

import { Page } from '@playwright/test';
import { ENV } from '../../../core/env.config';

/**
 * Page Object for Conduit signup/registration page.
 */
export class SignupPageObject {
  constructor(private page: Page) {}

  /**
   * Navigate to the signup page.
   */
  async navigateToSignupPage(): Promise<void> {
    await this.page.goto(`${ENV.BASE_URL}/#/register`, { waitUntil: 'networkidle' });
  }

  /**
   * Check if signup page is loaded.
   */
  async isSignupPageLoaded(): Promise<boolean> {
    return await this.page.isVisible('h1:has-text("Sign up")');
  }

  /**
   * Fill username field.
   */
  async fillUsernameInputField(username: string): Promise<void> {
    const inputs = await this.page.locator('input');
    await inputs.nth(0).fill(username);
  }

  /**
   * Fill email field.
   */
  async fillEmailInputField(email: string): Promise<void> {
    await this.page.fill('input[type="email"]', email);
  }

  /**
   * Fill password field.
   */
  async fillPasswordInputField(password: string): Promise<void> {
    await this.page.fill('input[type="password"]', password);
  }

  /**
   * Click the sign-up button.
   */
  async clickSignUpButton(): Promise<void> {
    await this.page.click('button:has-text("Sign up")');
  }

  /**
   * Complete full signup flow.
   */
  async performCompleteSignupFlow(
    username: string,
    email: string,
    password: string
  ): Promise<void> {
    await this.fillUsernameInputField(username);
    await this.fillEmailInputField(email);
    await this.fillPasswordInputField(password);
    await this.clickSignUpButton();
  }

  /**
   * Wait for navigation after signup.
   */
  async waitForNavigationToFeedPage(): Promise<void> {
    await this.page.waitForNavigation({ waitUntil: 'networkidle' });
  }
}
