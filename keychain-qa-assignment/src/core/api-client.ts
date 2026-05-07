/**
 * Core API Client for Conduit
 * 
 * Single-source API client that handles all HTTP requests with centralized
 * configuration, authentication, and error handling. All domain-specific
 * tests inherit this client to ensure consistent behavior.
 * 
 * @see https://github.com/cirosantilli/node-express-sequelize-realworld-example-app
 */

import { ENV } from './env.config';

export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  token?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  data?: T;
  errors?: Record<string, string[]>;
}

/**
 * Centralized API client for all domain tests.
 * 
 * Manages headers, authentication tokens, and provides typed request methods.
 * Domain-specific tests instantiate this and make calls via request() or
 * convenience methods (get, post, put, delete).
 * 
 * @example
 * const client = new ApiClient();
 * const response = await client.post('/users', { user: userData });
 * client.setAuthToken(token);
 * const user = await client.get('/user');
 */
export class ApiClient {
  private authToken: string | null = null;
  private baseUrl: string;

  /**
   * Initialize API client with optional base URL override.
   * 
   * @param baseUrl - Optional override for API base URL (defaults to ENV.API_URL)
   */
  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || ENV.API_URL;
  }

  /**
   * Set authentication token for subsequent requests.
   * 
   * Called after user login to include JWT in Authorization header.
   * 
   * @param token - JWT token from server response
   */
  public setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Retrieve current authentication token if set.
   * 
   * @returns JWT token or null if not authenticated
   */
  public getAuthToken(): string | null {
    return this.authToken;
  }

  /**
   * Clear authentication token (logout).
   */
  public clearAuthToken(): void {
    this.authToken = null;
  }

  /**
   * Check if client is currently authenticated.
   * 
   * @returns true if token is set, false otherwise
   */
  public isAuthenticated(): boolean {
    return this.authToken !== null;
  }

  /**
   * Build request headers including authentication if available.
   * 
   * @returns Headers object for fetch request
   */
  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Token ${this.authToken}`;
    }

    return headers;
  }

  /**
   * Make HTTP request to API endpoint.
   * 
   * Centralizes all request logic: URL construction, headers, body serialization,
   * response parsing, and error handling.
   * 
   * @param path - API endpoint path (e.g., '/users', '/articles')
   * @param config - Request configuration (method, body, optional token override)
   * @returns ApiResponse with success status, data, and error details
   */
  async request<T = unknown>(path: string, config: ApiRequestConfig = {}): Promise<ApiResponse<T>> {
    const { method = 'GET', body, token } = config;

    const url = `${this.baseUrl}${path}`;
    const headers = this.buildHeaders();

    // Allow token override for specific requests
    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();

      return {
        success: response.ok,
        statusCode: response.status,
        data: response.ok ? data?.data || data : undefined,
        errors: !response.ok ? data.errors : undefined,
      };
    } catch (error) {
      return {
        success: false,
        statusCode: 0,
        errors: { network: ['Network request failed'] },
      };
    }
  }

  /**
   * Make GET request to API endpoint.
   * 
   * @param path - API endpoint path
   * @returns ApiResponse with retrieved data
   */
  async get<T = unknown>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: 'GET' });
  }

  /**
   * Make POST request to API endpoint.
   * 
   * @param path - API endpoint path
   * @param body - Request body data
   * @returns ApiResponse with created data
   */
  async post<T = unknown>(path: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: 'POST', body });
  }

  /**
   * Make PUT request to API endpoint.
   * 
   * @param path - API endpoint path
   * @param body - Request body data
   * @returns ApiResponse with updated data
   */
  async put<T = unknown>(path: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: 'PUT', body });
  }

  /**
   * Make DELETE request to API endpoint.
   * 
   * @param path - API endpoint path
   * @returns ApiResponse confirming deletion
   */
  async delete<T = unknown>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: 'DELETE' });
  }
}

// Singleton instance for global use
export const apiClient = new ApiClient();
