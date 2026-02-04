import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import type { ApiResponse, PaginatedResponse } from '@/types';

// Base API URL - will be configured via environment variable
const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Base query with credentials
const baseQuery = fetchBaseQuery({
  baseUrl: `${baseUrl}/api`,
  credentials: 'include', // Important for cookie-based auth
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

// Track if we're currently refreshing to prevent multiple refresh attempts
let isRefreshing = false;
let refreshSubscribers: Array<() => void> = [];

// Notify all subscribers when refresh completes
const onRefreshed = () => {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
};

// Add subscriber to be notified when refresh completes
const addRefreshSubscriber = (callback: () => void) => {
  refreshSubscribers.push(callback);
};

// Base query with automatic token refresh
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await baseQuery(args, api, extraOptions);

  // If we get a 401, try to refresh the token
  if (result.error && result.error.status === 401) {
    // Skip refresh for auth endpoints to prevent infinite loops
    const url = typeof args === 'string' ? args : args.url;
    if (url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh')) {
      return result;
    }

    // If already refreshing, wait for that refresh to complete
    if (isRefreshing) {
      return new Promise((resolve) => {
        addRefreshSubscriber(async () => {
          const retryResult = await baseQuery(args, api, extraOptions);
          resolve(retryResult);
        });
      });
    }

    console.log('Token expired, attempting refresh...');
    isRefreshing = true;

    try {
      const refreshResult = await baseQuery(
        { url: '/auth/refresh', method: 'POST' },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        // Refresh successful
        console.log('Token refreshed successfully');
        isRefreshing = false;
        onRefreshed();
        
        // Retry the original query
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Refresh failed
        console.log('Token refresh failed');
        isRefreshing = false;
        
        // Only redirect if we're in the browser and not already on login page
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          setTimeout(() => {
            window.location.href = '/login';
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Refresh error:', error);
      isRefreshing = false;
    }
  }

  return result;
};

const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Auth', 'Tasks', 'Workflows', 'Notifications', 'Analytics', 'Users'],
  endpoints: () => ({}),
});

export const baseApi = api;

// Export hooks for usage in functional components
export const {} = api;

// Helper type for unwrapping API responses
export type UnwrapApiResponse<T> = T extends ApiResponse<infer U> ? U : T;
export type UnwrapPaginatedResponse<T> = T extends PaginatedResponse<infer U> ? U : T;
