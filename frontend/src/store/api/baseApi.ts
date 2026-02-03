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

// Base query with automatic token refresh
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await baseQuery(args, api, extraOptions);

  // If we get a 401, try to refresh the token
  if (result.error && result.error.status === 401) {
    console.log('Token expired, attempting refresh...');

    // Try to refresh the token
    const refreshResult = await baseQuery(
      { url: '/auth/refresh', method: 'POST' },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      // Refresh successful, retry the original query
      console.log('Token refreshed successfully');
      result = await baseQuery(args, api, extraOptions);
    } else {
      // Refresh failed, redirect to login
      console.log('Token refresh failed, redirecting to login');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
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
