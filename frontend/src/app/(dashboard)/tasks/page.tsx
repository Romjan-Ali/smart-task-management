import { fetchTasksServer, fetchWorkflowsServer } from '@/lib/server-api-client';
import { TaskBoard } from '@/components/tasks/TaskBoard';
import type { Task, Workflow, PaginatedResponse, ApiResponse } from '@/types';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function TasksPage() {
  // Fetch data on the server
  const [tasksResponse, workflowsResponse] = await Promise.all([
    fetchTasksServer(),
    fetchWorkflowsServer({ isDefault: true }),
  ]);

  const tasks = (tasksResponse as PaginatedResponse<Task>)?.data;
  const workflows = (workflowsResponse as PaginatedResponse<Workflow>)?.data;

  return <TaskBoard initialTasks={tasks} initialWorkflows={workflows} />;
}
