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
    await this.page.goto(`${ENV.BASE_URL}/#/`, { waitUntil: 'networkidle' });
  }

  /**
   * Check if feed page is loaded.
   */
  async isFeedPageLoaded(): Promise<boolean> {
    return await this.page.isVisible('text=Conduit');
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
    return await this.page.isVisible(`text=${title}`);
  }

  /**
   * Click on article in feed to open it.
   */
  async clickArticleInFeedByTitle(title: string): Promise<void> {
    await this.page.click(`text=${title}`);
  }

  /**
   * Wait for navigation to article page.
   */
  async waitForArticlePageNavigation(): Promise<void> {
    await this.page.waitForNavigation({ waitUntil: 'networkidle' });
  }

  /**
   * Check if user is logged in by checking for logout option.
   */
  async isUserLoggedIn(): Promise<boolean> {
    return await this.page.isVisible('a:has-text("Logout")');
  }

  /**
   * Get username displayed in navigation if logged in.
   */
  async getLoggedInUsername(): Promise<string | null> {
    const userLink = this.page.locator('a[href*="/profile/"]').first();
    return (await userLink.textContent()) || null;
  }

  /**
   * Click "New Article" button to go to editor.
   */
  async clickNewArticleButton(): Promise<void> {
    await this.page.click('a:has-text("New Article")');
  }

  /**
   * Click on user's profile link.
   */
  async clickUserProfileLink(username: string): Promise<void> {
    await this.page.click(`a[href*="/profile/${username}"]`);
  }

  /**
   * Wait for navigation to editor.
   */
  async waitForEditorNavigation(): Promise<void> {
    await this.page.waitForNavigation({ waitUntil: 'networkidle' });
  }
}
