/**
 * Data factory for generating test data.
 * 
 * Provides factory functions for creating consistent test data with
 * easy overrides. Used by tests to ensure data independence and reproducibility.
 */

import { ENV } from '../../src/core/env.config';

/**
 * Generate unique user registration data.
 * 
 * Creates user data with unique email/username to ensure test isolation.
 * Each call generates new credentials with timestamp.
 * 
 * @param overrides - Optional partial user data to override defaults
 * @returns Complete user data object
 * 
 * @example
 * const user = generateUserData();
 * const customUser = generateUserData({ username: 'john_doe' });
 */
export function generateUserData(
  overrides?: Partial<{ email: string; username: string; password: string }>
) {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substr(2, 9);

  return {
    email: `user_${timestamp}_${randomSuffix}@example.com`,
    username: `user_${timestamp}`,
    password: 'Test@Password123',
    ...overrides,
  };
}

/**
 * Generate article data for creation tests.
 * 
 * Creates article with unique title/description to ensure reproducibility.
 * 
 * @param overrides - Optional partial article data to override defaults
 * @returns Complete article data object
 * 
 * @example
 * const article = generateArticleData();
 * const featured = generateArticleData({ title: 'Featured Post' });
 */
export function generateArticleData(
  overrides?: Partial<{
    title: string;
    description: string;
    body: string;
    tagList: string[];
  }>
) {
  const timestamp = Date.now();

  return {
    title: `Test Article ${timestamp}`,
    description: `Article description created at ${new Date().toISOString()}`,
    body: 'This is the body of the test article containing substantial content. ' +
          'It demonstrates that the article creation flow works correctly with markdown support.',
    tagList: ['test', 'automation'],
    ...overrides,
  };
}

/**
 * Generate comment data for interaction tests.
 * 
 * Creates comment with timestamp for uniqueness.
 * 
 * @param overrides - Optional partial comment data to override defaults
 * @returns Complete comment data object
 * 
 * @example
 * const comment = generateCommentData();
 * const feedback = generateCommentData({ body: 'Great article!' });
 */
export function generateCommentData(
  overrides?: Partial<{ body: string }>
) {
  const timestamp = Date.now();

  return {
    body: `Test comment created at ${new Date().toISOString()} - ${timestamp}`,
    ...overrides,
  };
}

/**
 * Generate query parameters for article listing.
 * 
 * Creates filter/pagination parameters for listing endpoints.
 * 
 * @param overrides - Optional partial parameters to override defaults
 * @returns Complete query parameters object
 * 
 * @example
 * const query = generateArticleQuery({ limit: 20, offset: 10 });
 */
export function generateArticleQuery(
  overrides?: Partial<{ limit: number; offset: number; tag?: string; favorited?: string; author?: string }>
) {
  return {
    limit: 10,
    offset: 0,
    ...overrides,
  };
}
