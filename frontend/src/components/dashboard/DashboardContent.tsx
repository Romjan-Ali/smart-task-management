'use client';

import { useGetDashboardStatsQuery } from '@/store/api/analyticsApi';
import { useGetTasksQuery } from '@/store/api/taskApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/dashboard/StatCard';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  ListTodo,
  Users
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Task, DashboardStats } from '@/types';

interface DashboardContentProps {
  initialStats?: DashboardStats;
  initialTasks?: Task[];
}

export function DashboardContent({ initialStats, initialTasks }: DashboardContentProps) {
  const { data: statsData, isLoading: statsLoading } = useGetDashboardStatsQuery(undefined, {
    // Use initial data if available
    skip: false,
  });
  
  const { data: tasksData, isLoading: tasksLoading } = useGetTasksQuery({ limit: 5 }, {
    // Use initial data if available
    skip: false,
  });

  // Use server data as fallback
  const stats = statsData?.data || initialStats;
  const recentTasks = tasksData?.data || initialTasks || [];

  const formatCompletionTime = (ms: number) => {
    if (!ms || ms <= 0) return 'N/A';
    
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return 'N/A';
  };

  const getTaskStageName = (task: Task) => {
    if (typeof task.currentStage === 'string') return 'Unknown';
    return task.currentStage.name;
  };

  const getTaskStageColor = (task: Task) => {
    if (typeof task.currentStage === 'string') return '#6B7280';
    return task.currentStage.color;
  };

  if ((statsLoading || tasksLoading) && !initialStats && !initialTasks) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Overview of your tasks and workflows</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-25" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-15" />
                <Skeleton className="h-3 w-30 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-sm md:text-base text-muted-foreground">Overview of your tasks and workflows</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Tasks"
          value={stats?.totalTasks || 0}
          description="All tasks across workflows"
          icon={ListTodo}
        />
        <StatCard
          title="Completed Tasks"
          value={stats?.completedCount || 0}
          description={`${stats?.totalTasks ? Math.round((stats.completedCount / stats.totalTasks) * 100) : 0}% completion rate`}
          icon={CheckCircle2}
        />
        <StatCard
          title="Overdue Tasks"
          value={stats?.overdueCount || 0}
          description="Tasks past due date"
          icon={AlertCircle}
        />
        <StatCard
          title="Due Today"
          value={stats?.tasksDueToday || 0}
          description="Tasks due by end of day"
          icon={Clock}
        />
        <StatCard
          title="Avg Completion Time"
          value={stats?.avgCompletionTime ? formatCompletionTime(stats.avgCompletionTime) : 'N/A'}
          description="Average time to complete"
          icon={TrendingUp}
        />
        <StatCard
          title="Due This Week"
          value={stats?.tasksDueThisWeek || 0}
          description="Tasks due within 7 days"
          icon={Users}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
            <CardDescription>Your most recent task updates</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No tasks yet</p>
            ) : (
              <div className="space-y-4">
                {recentTasks.slice(0, 5).map((task) => (
                  <div key={task._id} className="flex items-center justify-between">
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-medium line-clamp-1">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Updated {formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true })}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      style={{
                        borderColor: getTaskStageColor(task),
                        color: getTaskStageColor(task),
                      }}
                    >
                      {getTaskStageName(task)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasks by Priority</CardTitle>
            <CardDescription>Distribution of task priorities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.tasksByPriority?.map((item) => (
                <div key={item.priority} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        item.priority === 'high'
                          ? 'destructive'
                          : item.priority === 'medium'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {item.priority}
                    </Badge>
                  </div>
                  <span className="text-2xl font-bold">{item.count}</span>
                </div>
              )) || (
                <p className="text-sm text-muted-foreground text-center py-4">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
