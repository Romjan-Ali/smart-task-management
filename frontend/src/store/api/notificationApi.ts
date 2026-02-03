import { baseApi } from './baseApi';
import type {
  Notification,
  NotificationQueryParams,
  ApiResponse,
  PaginatedResponse,
} from '@/types';

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get notifications
    getNotifications: builder.query<PaginatedResponse<Notification>, NotificationQueryParams | void>({
      query: (params = {}) => ({
        url: '/notifications',
        params: params || undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Notifications' as const, id: _id })),
              { type: 'Notifications', id: 'LIST' },
            ]
          : [{ type: 'Notifications', id: 'LIST' }],
    }),

    // Get unread count
    getUnreadCount: builder.query<ApiResponse<{ unreadCount: number }>, void>({
      query: () => '/notifications/unread-count',
      providesTags: [{ type: 'Notifications', id: 'UNREAD_COUNT' }],
    }),

    // Mark notification as read
    markAsRead: builder.mutation<ApiResponse<Notification>, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Notifications', id },
        { type: 'Notifications', id: 'LIST' },
        { type: 'Notifications', id: 'UNREAD_COUNT' },
      ],
    }),

    // Mark all as read
    markAllAsRead: builder.mutation<ApiResponse<{ modifiedCount: number }>, void>({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PATCH',
      }),
      invalidatesTags: [
        { type: 'Notifications', id: 'LIST' },
        { type: 'Notifications', id: 'UNREAD_COUNT' },
      ],
    }),

    // Delete notification
    deleteNotification: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'Notifications', id: 'LIST' },
        { type: 'Notifications', id: 'UNREAD_COUNT' },
      ],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
} = notificationApi;
