import { fetchDashboardStatsServer, fetchTasksServer } from '@/lib/server-api-client';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import type { DashboardStats, PaginatedResponse, Task, ApiResponse } from '@/types';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Fetch data on the server
  const [statsResponse, tasksResponse] = await Promise.all([
    fetchDashboardStatsServer(),
    fetchTasksServer({ limit: 5 }),
  ]);

  const stats = (statsResponse as ApiResponse<DashboardStats>)?.data;
  const tasks = (tasksResponse as PaginatedResponse<Task>)?.data;

  return <DashboardContent initialStats={stats} initialTasks={tasks} />;
}
