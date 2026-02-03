import { baseApi } from './baseApi';
import type {
  Task,
  CreateTaskData,
  UpdateTaskData,
  ChangeStageData,
  TaskQueryParams,
  ApiResponse,
  PaginatedResponse,
} from '@/types';

export const taskApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all tasks with filters
    getTasks: builder.query<PaginatedResponse<Task>, TaskQueryParams | void>({
      query: (params = {}) => ({
        url: '/tasks',
        params: params || undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Tasks' as const, id: _id })),
              { type: 'Tasks', id: 'LIST' },
            ]
          : [{ type: 'Tasks', id: 'LIST' }],
    }),

    // Get task by ID
    getTaskById: builder.query<ApiResponse<Task>, string>({
      query: (id) => `/tasks/${id}`,
      providesTags: (result, error, id) => [{ type: 'Tasks', id }],
    }),

    // Get task statistics
    getTaskStats: builder.query<ApiResponse<unknown>, { workflowId?: string; assignedTo?: string }>({
      query: (params) => ({
        url: '/tasks/stats',
        params,
      }),
      providesTags: ['Tasks'],
    }),

    // Create task
    createTask: builder.mutation<ApiResponse<Task>, CreateTaskData>({
      query: (data) => ({
        url: '/tasks',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Tasks', id: 'LIST' }],
    }),

    // Update task
    updateTask: builder.mutation<ApiResponse<Task>, { id: string; data: UpdateTaskData }>({
      query: ({ id, data }) => ({
        url: `/tasks/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Tasks', id },
        { type: 'Tasks', id: 'LIST' },
      ],
    }),

    // Change task stage
    changeTaskStage: builder.mutation<ApiResponse<Task>, { id: string; data: ChangeStageData }>({
      query: ({ id, data }) => ({
        url: `/tasks/${id}/stage`,
        method: 'PATCH',
        body: data,
      }),
      // Optimistic update
      async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          taskApi.util.updateQueryData('getTasks', undefined, (draft) => {
            const task = draft.data.find((t) => t._id === id);
            if (task && typeof data.stageId === 'string') {
              // Optimistically update - backend will populate full stage object
              (task.currentStage as unknown) = data.stageId;
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Tasks', id },
        { type: 'Tasks', id: 'LIST' },
      ],
    }),

    // Assign users to task
    assignUsersToTask: builder.mutation<ApiResponse<Task>, { id: string; userIds: string[] }>({
      query: ({ id, userIds }) => ({
        url: `/tasks/${id}/assign`,
        method: 'POST',
        body: { userIds },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Tasks', id },
        { type: 'Tasks', id: 'LIST' },
      ],
    }),

    // Unassign user from task
    unassignUserFromTask: builder.mutation<ApiResponse<Task>, { id: string; userId: string }>({
      query: ({ id, userId }) => ({
        url: `/tasks/${id}/assign/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Tasks', id },
        { type: 'Tasks', id: 'LIST' },
      ],
    }),

    // Delete task
    deleteTask: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Tasks', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useGetTaskByIdQuery,
  useGetTaskStatsQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useChangeTaskStageMutation,
  useAssignUsersToTaskMutation,
  useUnassignUserFromTaskMutation,
  useDeleteTaskMutation,
} = taskApi;
