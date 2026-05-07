/**
 * Content Domain - Feed Page Object
 * 
 * Encapsulates all interactions with the feed/home page.
 */

import { Page } from '@playwright/test';
import { ENV } from '../../../core/env.config';

/**
 * Page Object for the article feed page.
 */
export class FeedPageObject {
  constructor(private page: Page) {}

  /**
   * Navigate to home/feed page.
   */
  async navigateToFeedPage(): Promise<void> {
    await this.page.goto(`${ENV.BASE_URL}/`, { waitUntil: 'networkidle' });
  }

  /**
   * Check if feed page is loaded.
   */
  async isFeedPageLoaded(): Promise<boolean> {
    try {
      await this.page.locator('text=Conduit').waitFor({ timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get article count visible on feed.
   */
  async getVisibleArticleCount(): Promise<number> {
    return await this.page.locator('div.article-preview').count();
  }

  /**
   * Check if article with specific title exists in feed.
   */
  async doesArticleExistInFeed(title: string): Promise<boolean> {
    try {
      await this.page.locator(`text=${title}`).waitFor({ timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Click on article in feed to open it.
   */
  async clickArticleInFeedByTitle(title: string): Promise<void> {
    const articleLink = this.page.locator(`text=${title}`);
    await articleLink.waitFor({ timeout: 10000 });
    await articleLink.click();
  }

  /**
   * Check if user is logged in by checking for logout option.
   */
  async isUserLoggedIn(): Promise<boolean> {
    try {
      await this.page.locator('a:has-text("Logout")').waitFor({ timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get username displayed in navigation if logged in.
   */
  async getLoggedInUsername(): Promise<string | null> {
    const userLink = this.page.locator('a[href*="/profile/"]').first();
    try {
      await userLink.waitFor({ timeout: 5000 });
      return (await userLink.textContent()) || null;
    } catch {
      return null;
    }
  }

  /**
   * Click "New Article" button to go to editor.
   */
  async clickNewArticleButton(): Promise<void> {
    const newArticleBtn = this.page.locator('a:has-text("New Article")');
    await newArticleBtn.waitFor({ timeout: 10000 });
    await newArticleBtn.click();
  }

  /**
   * Click on user's profile link.
   */
  async clickUserProfileLink(username: string): Promise<void> {
    const profileLink = this.page.locator(`a[href*="/profile/${username}"]`);
    await profileLink.waitFor({ timeout: 10000 });
    await profileLink.click();
  }
}
