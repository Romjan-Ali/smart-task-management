import { baseApi } from './baseApi';
import type { User, ApiResponse } from '@/types';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all users
    getUsers: builder.query<ApiResponse<User[]>, { search?: string; role?: string } | void>({
      query: (params = {}) => ({
        url: '/users',
        params: params || undefined,
      }),
      providesTags: ['Users'],
    }),

    // Get user by ID
    getUserById: builder.query<ApiResponse<User>, string>({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'Users', id }],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
} = userApi;
