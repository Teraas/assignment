/**
 * Social Domain Tests - Comments and Interactions API Tests
 * 
 * Tests comment and interaction features via API:
 * - Add comment to article
 * - List comments on article
 * - Delete comment
 * - Favorite/unfavorite article
 * - Follow/unfollow user
 */

import { test, expect } from '../../fixtures/auth.fixture';
import { ApiClient } from '../../../src/core/api-client';
import { ENV } from '../../../src/core/env.config';
import { generateArticleData, generateCommentData, generateUserData } from '../../fixtures/data-factory';

test.describe('Social Domain: Comments and Interactions API', () => {
  /**
   * Test: User can add comment to an article.
   * 
   * Verifies comment creation and returns proper comment object.
   */
  test('should add a comment to an article', async ({
    authenticatedRequest,
    testUser,
  }) => {
    // Create an article
    const articleData = generateArticleData();
    const articleResponse = await authenticatedRequest.post(
      ENV.ENDPOINTS.ARTICLES,
      { article: articleData }
    );
    const slug = articleResponse.data?.article?.slug;

    // Add comment
    const commentData = generateCommentData();
    const response = await authenticatedRequest.post(
      ENV.ENDPOINTS.COMMENTS(slug),
      { comment: commentData }
    );

    expect(response.success).toBe(true);
    expect(response.data?.comment?.body).toBe(commentData.body);
    expect(response.data?.comment?.author?.username).toBe(testUser.username);
  });

  /**
   * Test: User can list comments on an article.
   * 
   * Verifies comments endpoint returns array of comments.
   */
  test('should list comments on an article', async ({
    authenticatedRequest,
  }) => {
    // Create article
    const articleData = generateArticleData();
    const articleResponse = await authenticatedRequest.post(
      ENV.ENDPOINTS.ARTICLES,
      { article: articleData }
    );
    const slug = articleResponse.data?.article?.slug;

    // Add a comment
    const commentData = generateCommentData();
    await authenticatedRequest.post(ENV.ENDPOINTS.COMMENTS(slug), {
      comment: commentData,
    });

    // List comments
    const response = await authenticatedRequest.get(ENV.ENDPOINTS.COMMENTS(slug));

    expect(response.success).toBe(true);
    expect(Array.isArray(response.data?.comments)).toBe(true);
    expect(response.data?.comments?.length).toBeGreaterThan(0);
  });

  /**
   * Test: User can delete their own comment.
   * 
   * Verifies comment deletion.
   */
  test('should delete own comment', async ({ authenticatedRequest }) => {
    // Create article and comment
    const articleData = generateArticleData();
    const articleResponse = await authenticatedRequest.post(
      ENV.ENDPOINTS.ARTICLES,
      { article: articleData }
    );
    const slug = articleResponse.data?.article?.slug;

    const commentData = generateCommentData();
    const commentResponse = await authenticatedRequest.post(
      ENV.ENDPOINTS.COMMENTS(slug),
      { comment: commentData }
    );
    const commentId = commentResponse.data?.comment?.id;

    // Delete comment
    const deleteResponse = await authenticatedRequest.delete(
      `${ENV.ENDPOINTS.COMMENTS(slug)}/${commentId}`
    );

    expect(deleteResponse.success).toBe(true);
  });

  /**
   * Test: User can favorite an article.
   * 
   * Verifies article favorite endpoint.
   */
  test('should favorite an article', async ({
    authenticatedRequest,
  }) => {
    // Create article
    const articleData = generateArticleData();
    const articleResponse = await authenticatedRequest.post(
      ENV.ENDPOINTS.ARTICLES,
      { article: articleData }
    );
    const slug = articleResponse.data?.article?.slug;

    // Favorite article
    const response = await authenticatedRequest.post(
      ENV.ENDPOINTS.FAVORITE(slug),
      {}
    );

    expect(response.success).toBe(true);
    expect(response.data?.article?.favorited).toBe(true);
    expect(response.data?.article?.favoritesCount).toBeGreaterThan(0);
  });

  /**
   * Test: User can unfavorite a previously favorited article.
   * 
   * Verifies favorite removal.
   */
  test('should unfavorite an article', async ({
    authenticatedRequest,
  }) => {
    // Create and favorite article
    const articleData = generateArticleData();
    const articleResponse = await authenticatedRequest.post(
      ENV.ENDPOINTS.ARTICLES,
      { article: articleData }
    );
    const slug = articleResponse.data?.article?.slug;

    await authenticatedRequest.post(ENV.ENDPOINTS.FAVORITE(slug), {});

    // Unfavorite
    const response = await authenticatedRequest.delete(
      ENV.ENDPOINTS.FAVORITE(slug)
    );

    expect(response.success).toBe(true);
    expect(response.data?.article?.favorited).toBe(false);
  });

  /**
   * Test: User can follow another user.
   * 
   * Verifies follow endpoint.
   */
  test('should follow another user', async ({
    authenticatedRequest,
  }) => {
    // Create second user
    const client = new ApiClient();
    const userData = generateUserData();
    const userResponse = await client.post(ENV.ENDPOINTS.USERS, {
      user: userData,
    });
    const username = userResponse.data?.user?.username;

    // Follow user
    const response = await authenticatedRequest.post(
      ENV.ENDPOINTS.FOLLOW(username),
      {}
    );

    expect(response.success).toBe(true);
    expect(response.data?.profile?.following).toBe(true);
  });

  /**
   * Test: User can unfollow a previously followed user.
   * 
   * Verifies follow removal.
   */
  test('should unfollow a user', async ({
    authenticatedRequest,
  }) => {
    // Create and follow user
    const client = new ApiClient();
    const userData = generateUserData();
    const userResponse = await client.post(ENV.ENDPOINTS.USERS, {
      user: userData,
    });
    const username = userResponse.data?.user?.username;

    await authenticatedRequest.post(ENV.ENDPOINTS.FOLLOW(username), {});

    // Unfollow
    const response = await authenticatedRequest.delete(
      ENV.ENDPOINTS.FOLLOW(username)
    );

    expect(response.success).toBe(true);
    expect(response.data?.profile?.following).toBe(false);
  });
});
