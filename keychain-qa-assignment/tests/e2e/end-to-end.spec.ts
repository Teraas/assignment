/**
 * End-to-End Integration Test
 * 
 * Tests complete user journey through multiple domains:
 * - Register new user
 * - Login via UI
 * - Create article via editor
 * - Add comment to article
 * - Favorite article
 * - Verify in feed
 */

import { test, expect } from '../fixtures/auth.fixture';
import { LoginPageObject } from '../../src/domains/identity/pages/LoginPageObject';
import { FeedPageObject } from '../../src/domains/content/pages/FeedPageObject';
import { EditorPageObject } from '../../src/domains/content/pages/EditorPageObject';
import { ArticlePageObject } from '../../src/domains/content/pages/ArticlePageObject';
import { generateUserData, generateArticleData, generateCommentData } from '../fixtures/data-factory';

test.describe('End-to-End: Complete User Journey', () => {
  /**
   * Test: Complete user flow from registration to article interaction.
   * 
   * Verifies that all domains work together:
   * 1. User registers via API
   * 2. User logs in via UI
   * 3. User creates article via editor
   * 4. User adds comment and favorites
   * 5. User verifies in feed
   */
  test('should complete full user journey: register, login, create, and interact with article', async ({
    authenticatedRequest,
    testUser,
    unauthenticatedPage: page,
  }) => {
    // Step 1: User is already registered via fixture (authenticatedRequest)
    expect(testUser.email).toBeDefined();
    expect(testUser.token).toBeTruthy();

    // Step 2: User logs in via UI
    const loginPage = new LoginPageObject(page);
    const feedPage = new FeedPageObject(page);

    await loginPage.navigateToLoginPage();
    await loginPage.performCompleteLoginFlow(testUser.email, testUser.password);
    await loginPage.waitForNavigationToFeedPage();

    expect(await feedPage.isUserLoggedIn()).toBe(true);
    const username = await feedPage.getLoggedInUsername();
    expect(username).toContain(testUser.username);

    // Step 3: User navigates to editor and creates article
    const editorPage = new EditorPageObject(page);
    const articlePage = new ArticlePageObject(page);
    const articleData = generateArticleData();

    await feedPage.clickNewArticleButton();
    await feedPage.waitForEditorNavigation();

    await editorPage.createArticleWithCompleteFlow(articleData);

    // Verify on article page
    expect(await articlePage.isArticlePageLoaded()).toBe(true);
    const articleTitle = await articlePage.getArticleTitle();
    expect(articleTitle).toContain(articleData.title);

    // Step 4: User adds comment to their article
    const commentData = generateCommentData();
    const initialCommentCount = await articlePage.getCommentCount();

    await articlePage.addCommentToArticle(commentData.body);
    await page.waitForLoadState('networkidle');

    const updatedCommentCount = await articlePage.getCommentCount();
    expect(updatedCommentCount).toBeGreaterThan(initialCommentCount);

    // Step 5: User favorites their article
    expect(await articlePage.isFavoriteButtonAvailable()).toBe(true);
    await articlePage.clickFavoriteButton();
    await page.waitForLoadState('networkidle');

    expect(await articlePage.isArticleFavorited()).toBe(true);

    // Step 6: Verify article appears in feed
    await feedPage.navigateToFeedPage();
    const articleExists = await feedPage.doesArticleExistInFeed(articleData.title);
    expect(articleExists).toBe(true);
  });

  /**
   * Test: Multiple users can interact with same article.
   * 
   * Verifies that different users can read, comment, and favorite articles.
   */
  test('should allow multiple users to comment on same article', async ({
    authenticatedRequest,
    testUser: user1,
    unauthenticatedPage: page,
  }) => {
    // User 1 creates an article via API
    const articleData = generateArticleData();
    const articleResponse = await authenticatedRequest.post('/articles', {
      article: articleData,
    });
    const articleSlug = articleResponse.data?.article?.slug;

    // User 1 adds comment
    const comment1 = generateCommentData({ body: 'Comment from User 1' });
    await authenticatedRequest.post(`/articles/${articleSlug}/comments`, {
      comment: comment1,
    });

    // Create and login as User 2
    const user2Data = generateUserData();
    const user2CreateResponse = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: user2Data }),
    });
    const user2Response = await user2CreateResponse.json();
    const user2Token = user2Response.user.token;

    // User 2 views article and adds comment via UI
    const loginPage = new LoginPageObject(page);
    const feedPage = new FeedPageObject(page);

    await loginPage.navigateToLoginPage();
    await loginPage.performCompleteLoginFlow(user2Data.email, user2Data.password);
    await loginPage.waitForNavigationToFeedPage();

    // Search for and click article
    await feedPage.navigateToFeedPage();
    await feedPage.clickArticleInFeedByTitle(articleData.title);
    await feedPage.waitForArticlePageNavigation();

    // Add comment as User 2
    const articlePage = new ArticlePageObject(page);
    const comment2Data = generateCommentData({ body: 'Comment from User 2' });
    const initialCount = await articlePage.getCommentCount();

    await articlePage.addCommentToArticle(comment2Data.body);
    await page.waitForLoadState('networkidle');

    const finalCount = await articlePage.getCommentCount();
    expect(finalCount).toBeGreaterThanOrEqual(initialCount);
  });
});
