/**
 * Content Domain Tests - Articles UI Tests
 * 
 * Tests article creation and viewing via UI:
 * - Navigate to editor
 * - Create article via form
 * - View created article
 */

import { test, expect } from '../../fixtures/auth.fixture';
import { EditorPageObject } from '../../../src/domains/content/pages/EditorPageObject';
import { ArticlePageObject } from '../../../src/domains/content/pages/ArticlePageObject';
import { FeedPageObject } from '../../../src/domains/content/pages/FeedPageObject';
import { generateArticleData } from '../../fixtures/data-factory';

test.describe('Content Domain: Articles UI', () => {
  /**
   * Test: User can create article via editor UI.
   * 
   * Verifies complete article creation flow: navigate to editor,
   * fill form, submit, and verify on article page.
   */
  test('should create an article via editor form', async ({
    authenticatedRequest,
    page,
  }) => {
    const editorPage = new EditorPageObject(page);
    const articlePage = new ArticlePageObject(page);
    const articleData = generateArticleData();

    // Navigate to editor
    await editorPage.navigateToEditorPage();
    expect(await editorPage.isEditorPageLoaded()).toBe(true);

    // Create article
    await editorPage.createArticleWithCompleteFlow(articleData);

    // Verify article page loaded
    expect(await articlePage.isArticlePageLoaded()).toBe(true);
    const title = await articlePage.getArticleTitle();
    expect(title).toContain(articleData.title);
  });

  /**
   * Test: Created article appears in feed.
   * 
   * Verifies article is visible in feed after creation.
   */
  test('should display created article in feed', async ({
    authenticatedRequest,
    page,
  }) => {
    const editorPage = new EditorPageObject(page);
    const feedPage = new FeedPageObject(page);
    const articleData = generateArticleData();

    // Create article
    await editorPage.navigateToEditorPage();
    await editorPage.createArticleWithCompleteFlow(articleData);

    // Navigate to feed
    await feedPage.navigateToFeedPage();

    // Verify article in feed
    const exists = await feedPage.doesArticleExistInFeed(articleData.title);
    expect(exists).toBe(true);
  });

  /**
   * Test: User can view article details from feed.
   * 
   * Verifies clicking article in feed navigates to article page.
   */
  test('should view article details by clicking from feed', async ({
    authenticatedRequest,
    page,
  }) => {
    const editorPage = new EditorPageObject(page);
    const feedPage = new FeedPageObject(page);
    const articlePage = new ArticlePageObject(page);
    const articleData = generateArticleData();

    // Create article
    await editorPage.navigateToEditorPage();
    await editorPage.createArticleWithCompleteFlow(articleData);

    // Go to feed and click article
    await feedPage.navigateToFeedPage();
    await feedPage.clickArticleInFeedByTitle(articleData.title);
    await feedPage.waitForArticlePageNavigation();

    // Verify article details
    expect(await articlePage.isArticlePageLoaded()).toBe(true);
    const title = await articlePage.getArticleTitle();
    expect(title).toContain(articleData.title);
  });

  /**
   * Test: Article author name is displayed correctly.
   * 
   * Verifies author attribution on article page.
   */
  test('should display article author information', async ({
    testUser,
    page,
  }) => {
    const editorPage = new EditorPageObject(page);
    const articlePage = new ArticlePageObject(page);
    const articleData = generateArticleData();

    // Create article
    await editorPage.navigateToEditorPage();
    await editorPage.createArticleWithCompleteFlow(articleData);

    // Verify author
    const author = await articlePage.getArticleAuthorName();
    expect(author).toContain(testUser.username);
  });
});
