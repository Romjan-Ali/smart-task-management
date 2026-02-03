import { baseApi } from './baseApi';
import type {
  Workflow,
  WorkflowStage,
  CreateWorkflowData,
  WorkflowQueryParams,
  ApiResponse,
  PaginatedResponse,
} from '@/types';

export const workflowApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all workflows
    getWorkflows: builder.query<PaginatedResponse<Workflow>, WorkflowQueryParams | void>({
      query: (params = {}) => ({
        url: '/workflows',
        params: params || undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Workflows' as const, id: _id })),
              { type: 'Workflows', id: 'LIST' },
            ]
          : [{ type: 'Workflows', id: 'LIST' }],
    }),

    // Get default workflows
    getDefaultWorkflows: builder.query<ApiResponse<Workflow[]>, void>({
      query: () => '/workflows/default',
      providesTags: [{ type: 'Workflows', id: 'DEFAULT' }],
    }),

    // Get workflow by ID
    getWorkflowById: builder.query<ApiResponse<Workflow>, string>({
      query: (id) => `/workflows/${id}`,
      providesTags: (result, error, id) => [{ type: 'Workflows', id }],
    }),

    // Get workflow stages
    getWorkflowStages: builder.query<ApiResponse<WorkflowStage[]>, string>({
      query: (id) => `/workflows/${id}/stages`,
      providesTags: (result, error, id) => [{ type: 'Workflows', id: `${id}-stages` }],
    }),

    // Create workflow
    createWorkflow: builder.mutation<ApiResponse<Workflow>, CreateWorkflowData>({
      query: (data) => ({
        url: '/workflows',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Workflows', id: 'LIST' }],
    }),

    // Update workflow
    updateWorkflow: builder.mutation<ApiResponse<Workflow>, { id: string; data: Partial<CreateWorkflowData> }>({
      query: ({ id, data }) => ({
        url: `/workflows/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Workflows', id },
        { type: 'Workflows', id: 'LIST' },
      ],
    }),

    // Delete workflow
    deleteWorkflow: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (id) => ({
        url: `/workflows/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Workflows', id: 'LIST' }],
    }),

    // Validate stage transition
    validateStageTransition: builder.mutation<
      ApiResponse<{ valid: boolean; message?: string }>,
      { workflowId: string; fromStageId: string; toStageId: string }
    >({
      query: ({ workflowId, fromStageId, toStageId }) => ({
        url: `/workflows/${workflowId}/validate-transition`,
        method: 'POST',
        body: { fromStageId, toStageId },
      }),
    }),
  }),
});

export const {
  useGetWorkflowsQuery,
  useGetDefaultWorkflowsQuery,
  useGetWorkflowByIdQuery,
  useGetWorkflowStagesQuery,
  useCreateWorkflowMutation,
  useUpdateWorkflowMutation,
  useDeleteWorkflowMutation,
  useValidateStageTransitionMutation,
} = workflowApi;
