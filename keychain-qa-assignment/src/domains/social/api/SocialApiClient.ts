/**
 * Social Domain API Client
 * 
 * Extends the base ApiClient with domain-specific typed methods for
 * social features: comments, favorites, follows.
 * 
 * Provides semantically meaningful methods:
 * - addComment()
 * - getComments()
 * - deleteComment()
 * - favoriteArticle()
 * - unfavoriteArticle()
 * - followUser()
 * - unfollowUser()
 * 
 * This is the pattern you'd replicate for 100s of services in large orgs.
 * 
 * @example
 * const socialClient = new SocialApiClient();
 * socialClient.setAuthToken(token);
 * await socialClient.addComment(slug, { body: 'Great article!' });
 * await socialClient.favoriteArticle(slug);
 * await socialClient.followUser('john_doe');
 */

import { ApiClient, ApiResponse } from '../../../core/api-client';
import { ENV } from '../../../core/env.config';

export interface CommentData {
  body: string;
}

export interface Comment {
  id: number;
  createdAt: string;
  updatedAt: string;
  body: string;
  author: {
    username: string;
    bio?: string;
    image?: string;
    following: boolean;
  };
}

export interface CommentResponse {
  comment: Comment;
}

export interface CommentsListResponse {
  comments: Comment[];
}

export interface Profile {
  username: string;
  bio?: string;
  image?: string;
  following: boolean;
}

export interface ProfileResponse {
  profile: Profile;
}

/**
 * API Client specialized for social features domain.
 * 
 * Provides typed methods for:
 * - Comments (add, list, delete)
 * - Favorites (favorite/unfavorite articles)
 * - Follows (follow/unfollow users)
 */
export class SocialApiClient extends ApiClient {
  /**
   * Add a comment to an article.
   * 
   * Requires: Auth token must be set via setAuthToken()
   * 
   * @param slug - Article slug to comment on
   * @param commentData - Comment body text
   * @returns ApiResponse with created comment
   */
  async addComment(slug: string, commentData: CommentData): Promise<ApiResponse<CommentResponse>> {
    return this.post<CommentResponse>(ENV.ENDPOINTS.COMMENTS(slug), {
      comment: commentData,
    });
  }

  /**
   * Get all comments on an article.
   * 
   * @param slug - Article slug
   * @returns ApiResponse with list of comments
   */
  async getComments(slug: string): Promise<ApiResponse<CommentsListResponse>> {
    return this.get<CommentsListResponse>(ENV.ENDPOINTS.COMMENTS(slug));
  }

  /**
   * Delete a comment from an article.
   * 
   * Requires: Auth token must be set. User must be comment author.
   * 
   * @param slug - Article slug
   * @param commentId - Comment ID to delete
   * @returns ApiResponse confirming deletion
   */
  async deleteComment(slug: string, commentId: number): Promise<ApiResponse<CommentResponse>> {
    return this.delete<CommentResponse>(`${ENV.ENDPOINTS.COMMENTS(slug)}/${commentId}`);
  }

  /**
   * Favorite an article.
   * 
   * Requires: Auth token must be set
   * 
   * @param slug - Article slug to favorite
   * @returns ApiResponse with updated article (favorited: true)
   */
  async favoriteArticle(slug: string): Promise<ApiResponse> {
    return this.post(ENV.ENDPOINTS.FAVORITE(slug), {});
  }

  /**
   * Remove article from favorites.
   * 
   * Requires: Auth token must be set
   * 
   * @param slug - Article slug to unfavorite
   * @returns ApiResponse with updated article (favorited: false)
   */
  async unfavoriteArticle(slug: string): Promise<ApiResponse> {
    return this.delete(ENV.ENDPOINTS.FAVORITE(slug));
  }

  /**
   * Follow a user.
   * 
   * Requires: Auth token must be set
   * 
   * @param username - Username to follow
   * @returns ApiResponse with profile (following: true)
   */
  async followUser(username: string): Promise<ApiResponse<ProfileResponse>> {
    return this.post<ProfileResponse>(ENV.ENDPOINTS.FOLLOW(username), {});
  }

  /**
   * Unfollow a user.
   * 
   * Requires: Auth token must be set
   * 
   * @param username - Username to unfollow
   * @returns ApiResponse with profile (following: false)
   */
  async unfollowUser(username: string): Promise<ApiResponse<ProfileResponse>> {
    return this.delete<ProfileResponse>(ENV.ENDPOINTS.FOLLOW(username));
  }

  /**
   * Get a user's profile information.
   * 
   * @param username - Username to get profile for
   * @returns ApiResponse with profile data
   */
  async getProfile(username: string): Promise<ApiResponse<ProfileResponse>> {
    return this.get<ProfileResponse>(ENV.ENDPOINTS.PROFILES(username));
  }
}
