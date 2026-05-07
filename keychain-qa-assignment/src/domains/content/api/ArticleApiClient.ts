/**
 * Content/Articles Domain API Client
 * 
 * Extends the base ApiClient with domain-specific typed methods for
 * article management (CRUD operations). Tests in the content domain
 * use this instead of raw API calls.
 * 
 * Provides semantically meaningful methods:
 * - createArticle()
 * - getArticle()
 * - updateArticle()
 * - deleteArticle()
 * - listArticles()
 * 
 * Same pattern as IdentityApiClient - if you have 100s of services,
 * you'd have 100s of these domain clients.
 * 
 * @example
 * const articleClient = new ArticleApiClient();
 * articleClient.setAuthToken(token);
 * const article = await articleClient.createArticle({ title, body, ... });
 * const list = await articleClient.listArticles({ limit: 20, offset: 0 });
 */

import { ApiClient, ApiResponse } from '../../../core/api-client';
import { ENV } from '../../../core/env.config';

export interface ArticleData {
  title: string;
  description: string;
  body: string;
  tagList?: string[];
}

export interface Article extends ArticleData {
  slug: string;
  createdAt: string;
  updatedAt: string;
  favorited: boolean;
  favoritesCount: number;
  author: {
    username: string;
    bio?: string;
    image?: string;
    following: boolean;
  };
}

export interface ArticleResponse {
  article: Article;
}

export interface ArticlesListResponse {
  articles: Article[];
  articlesCount: number;
}

export interface ArticleListQuery {
  limit?: number;
  offset?: number;
  tag?: string;
  author?: string;
  favorited?: string;
}

/**
 * API Client specialized for content/articles domain.
 * 
 * Provides typed methods for:
 * - Creating articles
 * - Reading/listing articles
 * - Updating articles
 * - Deleting articles
 * - Pagination and filtering
 */
export class ArticleApiClient extends ApiClient {
  /**
   * Create a new article.
   * 
   * Requires: Auth token must be set via setAuthToken()
   * 
   * @param articleData - Article title, description, body, tags
   * @returns ApiResponse with created article including slug
   */
  async createArticle(articleData: ArticleData): Promise<ApiResponse<ArticleResponse>> {
    return this.post<ArticleResponse>(ENV.ENDPOINTS.ARTICLES, {
      article: articleData,
    });
  }

  /**
   * Get a specific article by slug.
   * 
   * @param slug - Article slug identifier
   * @returns ApiResponse with article details
   */
  async getArticle(slug: string): Promise<ApiResponse<ArticleResponse>> {
    return this.get<ArticleResponse>(ENV.ENDPOINTS.ARTICLE_DETAIL(slug));
  }

  /**
   * List articles with optional filtering and pagination.
   * 
   * @param query - Filter and pagination options (limit, offset, tag, author, etc)
   * @returns ApiResponse with article list and total count
   */
  async listArticles(query?: ArticleListQuery): Promise<ApiResponse<ArticlesListResponse>> {
    const params = new URLSearchParams();
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.offset) params.append('offset', query.offset.toString());
    if (query?.tag) params.append('tag', query.tag);
    if (query?.author) params.append('author', query.author);
    if (query?.favorited) params.append('favorited', query.favorited);

    const queryString = params.toString();
    const path = queryString ? `${ENV.ENDPOINTS.ARTICLES}?${queryString}` : ENV.ENDPOINTS.ARTICLES;

    return this.get<ArticlesListResponse>(path);
  }

  /**
   * Update an existing article.
   * 
   * Requires: Auth token must be set. User must be article author.
   * 
   * @param slug - Article slug to update
   * @param updates - Partial article data to update
   * @returns ApiResponse with updated article
   */
  async updateArticle(
    slug: string,
    updates: Partial<ArticleData>
  ): Promise<ApiResponse<ArticleResponse>> {
    return this.put<ArticleResponse>(ENV.ENDPOINTS.ARTICLE_DETAIL(slug), {
      article: updates,
    });
  }

  /**
   * Delete an article.
   * 
   * Requires: Auth token must be set. User must be article author.
   * 
   * @param slug - Article slug to delete
   * @returns ApiResponse confirming deletion
   */
  async deleteArticle(slug: string): Promise<ApiResponse<ArticleResponse>> {
    return this.delete<ArticleResponse>(ENV.ENDPOINTS.ARTICLE_DETAIL(slug));
  }

  /**
   * Get articles filtered by tag.
   * 
   * @param tag - Tag to filter by
   * @param limit - Number of articles to return
   * @returns ApiResponse with filtered articles
   */
  async getArticlesByTag(tag: string, limit: number = 10): Promise<ApiResponse<ArticlesListResponse>> {
    return this.listArticles({ tag, limit });
  }

  /**
   * Get articles from a specific author.
   * 
   * @param author - Author username
   * @param limit - Number of articles to return
   * @returns ApiResponse with author's articles
   */
  async getArticlesByAuthor(author: string, limit: number = 10): Promise<ApiResponse<ArticlesListResponse>> {
    return this.listArticles({ author, limit });
  }

  /**
   * Get user's favorite articles.
   * 
   * Requires: Auth token must be set
   * 
   * @param username - Username whose favorites to get
   * @param limit - Number of articles to return
   * @returns ApiResponse with favorited articles
   */
  async getUserFavorites(username: string, limit: number = 10): Promise<ApiResponse<ArticlesListResponse>> {
    return this.listArticles({ favorited: username, limit });
  }
}
