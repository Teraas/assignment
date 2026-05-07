/**
 * Content Domain - Article Page Object
 * 
 * Encapsulates all interactions with individual article pages /#/article/:slug.
 */

import { Page } from '@playwright/test';

/**
 * Page Object for viewing individual article.
 */
export class ArticlePageObject {
  constructor(private page: Page) {}

  /**
   * Check if article page is loaded.
   */
  async isArticlePageLoaded(): Promise<boolean> {
    return await this.page.isVisible('h1');
  }

  /**
   * Get article title.
   */
  async getArticleTitle(): Promise<string> {
    return (await this.page.locator('h1').textContent()) || '';
  }

  /**
   * Get article description.
   */
  async getArticleDescription(): Promise<string> {
    return (await this.page.locator('h2').textContent()) || '';
  }

  /**
   * Get article body content.
   */
  async getArticleBodyContent(): Promise<string> {
    return (await this.page.locator('div.article-content').textContent()) || '';
  }

  /**
   * Get article author name.
   */
  async getArticleAuthorName(): Promise<string> {
    const authorElement = await this.page.locator('a.author');
    return (await authorElement.textContent()) || '';
  }

  /**
   * Check if favorite button is available.
   */
  async isFavoriteButtonAvailable(): Promise<boolean> {
    return await this.page.isVisible('button:has-text("Favorite")');
  }

  /**
   * Click favorite button to favorite the article.
   */
  async clickFavoriteButton(): Promise<void> {
    await this.page.click('button:has-text("Favorite")');
  }

  /**
   * Check if article is already favorited (unfavorite button visible).
   */
  async isArticleFavorited(): Promise<boolean> {
    return await this.page.isVisible('button:has-text("Unfavorite")');
  }

  /**
   * Get current comment count.
   */
  async getCommentCount(): Promise<number> {
    return await this.page.locator('div.card.comment-card').count();
  }

  /**
   * Add a comment to the article.
   */
  async addCommentToArticle(commentText: string): Promise<void> {
    await this.page.fill('textarea.form-control', commentText);
    await this.page.click('button:has-text("Post Comment")');
  }

  /**
   * Check if edit article button is visible (owner only).
   */
  async isEditButtonVisible(): Promise<boolean> {
    return await this.page.isVisible('a:has-text("Edit Article")');
  }

  /**
   * Click delete article button to remove article.
   */
  async clickDeleteArticleButton(): Promise<void> {
    await this.page.click('button:has-text("Delete Article")');
  }

  /**
   * Wait for deletion navigation.
   */
  async waitForDeletionNavigation(): Promise<void> {
    await this.page.waitForNavigation({ waitUntil: 'networkidle' });
  }
}
