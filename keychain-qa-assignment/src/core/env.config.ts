/**
 * Environment configuration for Conduit test suite.
 * Centralized place for all URLs, timeouts, and test defaults.
 */

export const ENV = {
  // Application URLs
  BASE_URL: process.env.BASE_URL || 'http://localhost:4101',
  API_URL: process.env.API_URL || 'http://localhost:3000/api',

  // Timeouts (milliseconds)
  DEFAULT_TIMEOUT: 30000,
  NAVIGATION_TIMEOUT: 10000,
  SHORT_TIMEOUT: 5000,

  // API Endpoints
  ENDPOINTS: {
    USERS: '/users',
    LOGIN: '/users/login',
    CURRENT_USER: '/user',
    ARTICLES: '/articles',
    ARTICLE_DETAIL: (slug: string) => `/articles/${slug}`,
    COMMENTS: (slug: string) => `/articles/${slug}/comments`,
    FAVORITE: (slug: string) => `/articles/${slug}/favorite`,
    PROFILES: (username: string) => `/profiles/${username}`,
    FOLLOW: (username: string) => `/profiles/${username}/follow`,
    TAGS: '/tags',
  },

  // Test data defaults
  TEST_USER: {
    email: `testuser_${Date.now()}@example.com`,
    username: `testuser_${Date.now()}`,
    password: 'Test@Password123',
  },
};

export default ENV;
