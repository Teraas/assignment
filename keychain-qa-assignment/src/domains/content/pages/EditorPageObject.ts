/**
 * Content Domain - Editor Page Object
 * 
 * Encapsulates all interactions with the article editor page /#/editor.
 */

import { Page } from '@playwright/test';
import { ENV } from '../../../core/env.config';

/**
 * Page Object for Conduit article editor page.
 * 
 * Manages article creation and editing flows including form fields,
 * tag input, and publication.
 */
export class EditorPageObject {
  constructor(private page: Page) {}

  /**
   * Navigate to the article editor page.
   */
  async navigateToEditorPage(): Promise<void> {
    await this.page.goto(`${ENV.BASE_URL}/#/editor`, { waitUntil: 'networkidle' });
  }

  /**
   * Check if editor page is loaded.
   */
  async isEditorPageLoaded(): Promise<boolean> {
    return await this.page.isVisible('input[placeholder="Article Title"]');
  }

  /**
   * Fill article title field.
   */
  async fillTitleInputField(title: string): Promise<void> {
    await this.page.fill('input[placeholder="Article Title"]', title);
  }

  /**
   * Fill article description/subtitle field.
   */
  async fillDescriptionInputField(description: string): Promise<void> {
    await this.page.fill(
      'input[placeholder="What\'s this article about?"]',
      description
    );
  }

  /**
   * Fill article body/content field.
   */
  async fillBodyTextareaField(body: string): Promise<void> {
    await this.page.fill(
      'textarea[placeholder="Write your article (in markdown)"]',
      body
    );
  }

  /**
   * Add a tag to the article.
   */
  async addTagToArticle(tag: string): Promise<void> {
    const tagInput = this.page.locator('input[placeholder="Enter tags"]');
    await tagInput.fill(tag);
    await this.page.keyboard.press('Enter');
  }

  /**
   * Add multiple tags to the article.
   */
  async addMultipleTagsToArticle(tags: string[]): Promise<void> {
    for (const tag of tags) {
      await this.addTagToArticle(tag);
    }
  }

  /**
   * Click the publish button to create/update article.
   */
  async clickPublishButton(): Promise<void> {
    await this.page.click('button:has-text("Publish Article")');
  }

  /**
   * Wait for successful article publication navigation.
   */
  async waitForPublicationNavigation(): Promise<void> {
    await this.page.waitForNavigation({ waitUntil: 'networkidle' });
  }

  /**
   * Complete full article creation flow.
   */
  async createArticleWithCompleteFlow(data: {
    title: string;
    description: string;
    body: string;
    tags?: string[];
  }): Promise<void> {
    await this.fillTitleInputField(data.title);
    await this.fillDescriptionInputField(data.description);
    await this.fillBodyTextareaField(data.body);

    if (data.tags && data.tags.length > 0) {
      await this.addMultipleTagsToArticle(data.tags);
    }

    await this.clickPublishButton();
    await this.waitForPublicationNavigation();
  }
}
