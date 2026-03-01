/**
 * Centralized API Client for Admin Dashboard
 * Handles authentication, error handling, and response parsing
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface ApiError {
  message: string;
  status?: number;
  statusText?: string;
  data?: any;
}

export class ApiClientError extends Error {
  status?: number;
  statusText?: string;
  data?: any;

  constructor(message: string, status?: number, statusText?: string, data?: any) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

interface RequestOptions extends RequestInit {
  requireAuth?: boolean;
  timeout?: number;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_URL) {
    this.baseURL = baseURL;
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      requireAuth = true, // Default to true for admin
      timeout = 30000,
      headers = {},
      ...fetchOptions
    } = options;

    const url = `${this.baseURL}${endpoint}`;
    const requestHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (requireAuth) {
      const token = this.getAuthToken();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      } else {
        throw new ApiClientError('Authentication required', 401);
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: requestHeaders,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      const isJson = contentType?.includes('application/json');

      if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}`;
        let errorData: any = null;

        if (isJson) {
          try {
            errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch {
            // Failed to parse JSON error
          }
        } else {
          const text = await response.text();
          errorMessage = text || errorMessage;
        }

        // Handle 401/403 - redirect to login
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }

        throw new ApiClientError(
          errorMessage,
          response.status,
          response.statusText,
          errorData
        );
      }

      if (isJson) {
        return await response.json();
      }

      // Handle blob responses (for file downloads)
      if (contentType?.includes('application/octet-stream') || 
          contentType?.includes('application/pdf') ||
          contentType?.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
        return (await response.blob()) as unknown as T;
      }

      // Handle text responses
      return (await response.text()) as unknown as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiClientError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiClientError('Request timeout', 408);
        }
        if (error.message.includes('fetch')) {
          throw new ApiClientError(
            'Network error: Unable to connect to server. Please check if the backend is running.',
            0
          );
        }
        throw new ApiClientError(error.message);
      }

      throw new ApiClientError('An unexpected error occurred');
    }
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
