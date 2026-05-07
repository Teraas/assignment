/**
 * Identity Domain API Client
 * 
 * Extends the base ApiClient with domain-specific typed methods for
 * user authentication and management. Tests in the identity domain
 * use this instead of raw API calls.
 * 
 * Benefits:
 * - Typed responses specific to identity domain
 * - Domain semantics (registerUser, loginUser, getCurrentUser)
 * - Single place to manage all identity APIs
 * - Easy for agents to discover what operations exist
 * - Scales to hundreds of services
 * 
 * @example
 * const identityClient = new IdentityApiClient();
 * const response = await identityClient.registerUser({ email, username, password });
 * identityClient.setAuthToken(response.data.user.token);
 * const currentUser = await identityClient.getCurrentUser();
 */

import { ApiClient, ApiResponse } from '../../../core/api-client';
import { ENV } from '../../../core/env.config';

export interface UserData {
  email: string;
  username: string;
  password: string;
}

export interface User {
  email: string;
  username: string;
  bio?: string;
  image?: string;
  token: string;
}

export interface UserResponse {
  user: User;
}

/**
 * API Client specialized for identity/authentication domain.
 * 
 * Provides typed methods for:
 * - User registration
 * - User login
 * - Current user retrieval
 * - User profile updates
 */
export class IdentityApiClient extends ApiClient {
  /**
   * Register a new user.
   * 
   * @param userData - User email, username, and password
   * @returns ApiResponse with user object including token
   */
  async registerUser(userData: UserData): Promise<ApiResponse<UserResponse>> {
    return this.post<UserResponse>(ENV.ENDPOINTS.USERS, {
      user: userData,
    });
  }

  /**
   * Login user and retrieve authentication token.
   * 
   * @param email - User email address
   * @param password - User password
   * @returns ApiResponse with user object including fresh token
   */
  async loginUser(email: string, password: string): Promise<ApiResponse<UserResponse>> {
    return this.post<UserResponse>(ENV.ENDPOINTS.LOGIN, {
      user: { email, password },
    });
  }

  /**
   * Get current authenticated user profile.
   * 
   * Requires: Auth token must be set via setAuthToken()
   * 
   * @returns ApiResponse with current user data
   */
  async getCurrentUser(): Promise<ApiResponse<UserResponse>> {
    return this.get<UserResponse>(ENV.ENDPOINTS.CURRENT_USER);
  }

  /**
   * Update current user profile (bio, image, etc).
   * 
   * Requires: Auth token must be set via setAuthToken()
   * 
   * @param updates - Partial user data to update
   * @returns ApiResponse with updated user
   */
  async updateUserProfile(
    updates: Partial<UserData>
  ): Promise<ApiResponse<UserResponse>> {
    return this.put<UserResponse>(ENV.ENDPOINTS.CURRENT_USER, {
      user: updates,
    });
  }

  /**
   * Convenience method: Register and login in one step.
   * 
   * Useful for test setup - creates user and sets token automatically.
   * 
   * @param userData - Registration data
   * @returns ApiResponse with authenticated user
   */
  async registerAndLogin(userData: UserData): Promise<ApiResponse<UserResponse>> {
    // Register
    const registerResponse = await this.registerUser(userData);
    if (!registerResponse.success) {
      return registerResponse;
    }

    // Login to get fresh token
    const loginResponse = await this.loginUser(userData.email, userData.password);
    if (loginResponse.success) {
      this.setAuthToken(loginResponse.data!.user.token);
    }

    return loginResponse;
  }
}
