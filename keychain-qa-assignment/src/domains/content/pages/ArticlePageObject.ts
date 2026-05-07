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
    try {
      await this.page.locator('h1').waitFor({ timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get article title.
   */
  async getArticleTitle(): Promise<string> {
    const titleLocator = this.page.locator('h1');
    await titleLocator.waitFor({ timeout: 10000 });
    return (await titleLocator.textContent()) || '';
  }

  /**
   * Get article description.
   */
  async getArticleDescription(): Promise<string> {
    const descLocator = this.page.locator('h2');
    await descLocator.waitFor({ timeout: 10000 });
    return (await descLocator.textContent()) || '';
  }

  /**
   * Get article body content.
   */
  async getArticleBodyContent(): Promise<string> {
    const bodyLocator = this.page.locator('div.article-content');
    await bodyLocator.waitFor({ timeout: 10000 });
    return (await bodyLocator.textContent()) || '';
  }

  /**
   * Get article author name.
   */
  async getArticleAuthorName(): Promise<string> {
    const authorElement = this.page.locator('a.author');
    await authorElement.waitFor({ timeout: 10000 });
    return (await authorElement.textContent()) || '';
  }

  /**
   * Check if favorite button is available.
   */
  async isFavoriteButtonAvailable(): Promise<boolean> {
    try {
      await this.page.locator('button:has-text("Favorite")').waitFor({ timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Click favorite button to favorite the article.
   */
  async clickFavoriteButton(): Promise<void> {
    const favBtn = this.page.locator('button:has-text("Favorite")');
    await favBtn.waitFor({ timeout: 10000 });
    await favBtn.click();
  }

  /**
   * Check if article is already favorited (unfavorite button visible).
   */
  async isArticleFavorited(): Promise<boolean> {
    try {
      await this.page.locator('button:has-text("Unfavorite")').waitFor({ timeout: 5000 });
      return true;
    } catch {
      return false;
    }
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
    const commentField = this.page.locator('textarea.form-control');
    await commentField.waitFor({ timeout: 10000 });
    await commentField.fill(commentText);
    const postBtn = this.page.locator('button:has-text("Post Comment")');
    await postBtn.waitFor({ timeout: 10000 });
    await postBtn.click();
  }

  /**
   * Check if edit article button is visible (owner only).
   */
  async isEditButtonVisible(): Promise<boolean> {
    try {
      await this.page.locator('a:has-text("Edit Article")').waitFor({ timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Click delete article button to remove article.
   */
  async clickDeleteArticleButton(): Promise<void> {
    const deleteBtn = this.page.locator('button:has-text("Delete Article")');
    await deleteBtn.waitFor({ timeout: 10000 });
    await deleteBtn.click();
  }

  /**
   * Wait for deletion navigation.
   */
  async waitForDeletionNavigation(): Promise<void> {
    await this.page.waitForNavigation({ waitUntil: 'networkidle' });
  }
}
