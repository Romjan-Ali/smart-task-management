import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ApiResponse, PaginatedResponse } from '@/types';

// Base API URL - will be configured via environment variable
const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}/api`,
    credentials: 'include', // Important for cookie-based auth
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Auth', 'Tasks', 'Workflows', 'Notifications', 'Analytics', 'Users'],
  endpoints: () => ({}),
});

// Export hooks for usage in functional components
export const {} = baseApi;

// Helper type for unwrapping API responses
export type UnwrapApiResponse<T> = T extends ApiResponse<infer U> ? U : T;
export type UnwrapPaginatedResponse<T> = T extends PaginatedResponse<infer U> ? U : T;
