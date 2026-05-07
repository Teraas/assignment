/**
 * Content Domain Tests - Articles API Tests
 * 
 * Tests article CRUD operations via API:
 * - Create article
 * - List articles
 * - Retrieve single article
 * - Update article
 * - Delete article
 */

import { test, expect } from '../../fixtures/auth.fixture';
import { ENV } from '../../../src/core/env.config';
import { generateArticleData } from '../../fixtures/data-factory';

test.describe('Content Domain: Articles API', () => {
  /**
   * Test: User can create a new article via API.
   * 
   * Verifies article creation returns proper article object with slug,
   * timestamps, and author information.
   */
  test('should create a new article with valid data', async ({
    authenticatedRequest,
    testUser,
  }) => {
    const articleData = generateArticleData();

    const response = await authenticatedRequest.post(ENV.ENDPOINTS.ARTICLES, {
      article: articleData,
    });

    expect(response.success).toBe(true);
    expect(response.statusCode).toBe(200);
    expect(response.data?.article?.title).toBe(articleData.title);
    expect(response.data?.article?.description).toBe(articleData.description);
    expect(response.data?.article?.slug).toBeDefined();
    expect(response.data?.article?.author?.username).toBe(testUser.username);
  });

  /**
   * Test: User can retrieve list of articles.
   * 
   * Verifies articles endpoint returns array with count.
   */
  test('should list articles with pagination', async ({ authenticatedRequest }) => {
    const response = await authenticatedRequest.get(
      `${ENV.ENDPOINTS.ARTICLES}?limit=10&offset=0`
    );

    expect(response.success).toBe(true);
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.data?.articles)).toBe(true);
    expect(response.data?.articlesCount).toBeDefined();
  });

  /**
   * Test: User can retrieve a specific article by slug.
   * 
   * Verifies getting single article with full details.
   */
  test('should retrieve a specific article by slug', async ({
    authenticatedRequest,
  }) => {
    // Create an article first
    const articleData = generateArticleData();
    const createResponse = await authenticatedRequest.post(
      ENV.ENDPOINTS.ARTICLES,
      { article: articleData }
    );
    const slug = createResponse.data?.article?.slug;

    // Retrieve the created article
    const response = await authenticatedRequest.get(
      ENV.ENDPOINTS.ARTICLE_DETAIL(slug)
    );

    expect(response.success).toBe(true);
    expect(response.statusCode).toBe(200);
    expect(response.data?.article?.slug).toBe(slug);
    expect(response.data?.article?.title).toBe(articleData.title);
  });

  /**
   * Test: User can update their own article.
   * 
   * Verifies PUT endpoint updates article fields.
   */
  test('should update an article', async ({ authenticatedRequest }) => {
    // Create article
    const articleData = generateArticleData();
    const createResponse = await authenticatedRequest.post(
      ENV.ENDPOINTS.ARTICLES,
      { article: articleData }
    );
    const slug = createResponse.data?.article?.slug;

    // Update article
    const updatedTitle = `Updated ${articleData.title}`;
    const updateResponse = await authenticatedRequest.put(
      ENV.ENDPOINTS.ARTICLE_DETAIL(slug),
      {
        article: { title: updatedTitle, body: 'Updated body content' },
      }
    );

    expect(updateResponse.success).toBe(true);
    expect(updateResponse.data?.article?.title).toBe(updatedTitle);
  });

  /**
   * Test: User can delete their own article.
   * 
   * Verifies DELETE endpoint removes article.
   */
  test('should delete an article', async ({ authenticatedRequest }) => {
    // Create article
    const articleData = generateArticleData();
    const createResponse = await authenticatedRequest.post(
      ENV.ENDPOINTS.ARTICLES,
      { article: articleData }
    );
    const slug = createResponse.data?.article?.slug;

    // Delete article
    const deleteResponse = await authenticatedRequest.delete(
      ENV.ENDPOINTS.ARTICLE_DETAIL(slug)
    );

    expect(deleteResponse.success).toBe(true);

    // Verify it's deleted (should return 404)
    const getResponse = await authenticatedRequest.get(
      ENV.ENDPOINTS.ARTICLE_DETAIL(slug)
    );
    expect(getResponse.success).toBe(false);
  });

  /**
   * Test: Article creation requires title and description.
   * 
   * Verifies API validates required fields.
   */
  test('should reject article creation with missing required fields', async ({
    authenticatedRequest,
  }) => {
    const response = await authenticatedRequest.post(ENV.ENDPOINTS.ARTICLES, {
      article: { body: 'Only body, missing title' },
    });

    expect(response.success).toBe(false);
    expect(response.errors).toBeDefined();
  });

  /**
   * Test: Unauthenticated user cannot create article.
   * 
   * Verifies article creation requires authentication.
   */
  test('should reject article creation when not authenticated', async () => {
    const unauthenticatedClient = new ApiClient();

    const articleData = generateArticleData();
    const response = await unauthenticatedClient.post(ENV.ENDPOINTS.ARTICLES, {
      article: articleData,
    });

    expect(response.success).toBe(false);
  });
});
