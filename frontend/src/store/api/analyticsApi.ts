import { baseApi } from './baseApi';
import type {
  DashboardStats,
  WorkflowEfficiency,
  UserPerformance,
  AnalyticsQueryParams,
  ApiResponse,
} from '@/types';

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get dashboard statistics
    getDashboardStats: builder.query<ApiResponse<DashboardStats>, AnalyticsQueryParams | void>({
      query: (params = {}) => ({
        url: '/analytics/dashboard',
        params: params || undefined,
      }),
      providesTags: ['Analytics'],
    }),

    // Get workflow efficiency
    getWorkflowEfficiency: builder.query<ApiResponse<WorkflowEfficiency[]>, { workflowId?: string }>({
      query: (params) => ({
        url: '/analytics/workflow-efficiency',
        params,
      }),
      providesTags: ['Analytics'],
    }),

    // Get user performance
    getUserPerformance: builder.query<ApiResponse<UserPerformance[]>, { userId?: string }>({
      query: (params) => ({
        url: '/analytics/user-performance',
        params,
      }),
      providesTags: ['Analytics'],
    }),

    // Get tasks per stage for a workflow
    getTasksPerStage: builder.query<ApiResponse<unknown>, string>({
      query: (workflowId) => `/analytics/workflow/${workflowId}/stages`,
      providesTags: ['Analytics'],
    }),

    // Get completion time trends
    getCompletionTrends: builder.query<ApiResponse<unknown>, { days?: number }>({
      query: (params) => ({
        url: '/analytics/completion-trends',
        params,
      }),
      providesTags: ['Analytics'],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetWorkflowEfficiencyQuery,
  useGetUserPerformanceQuery,
  useGetTasksPerStageQuery,
  useGetCompletionTrendsQuery,
} = analyticsApi;
