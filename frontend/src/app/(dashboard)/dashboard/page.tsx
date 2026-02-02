'use client';

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

export default function DashboardPage() {
  // TODO: Replace with actual data from analytics API
  const stats = {
    totalTasks: 24,
    completedTasks: 12,
    overdueTasks: 3,
    tasksDueToday: 5,
    avgCompletionTime: '3.2 days',
    activeWorkflows: 4,
  };

  const isLoading = false; // TODO: Replace with actual loading state

  if (isLoading) {
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
                <Skeleton className="h-4 w-[100px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[60px]" />
                <Skeleton className="h-3 w-[120px] mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your tasks and workflows</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Tasks"
          value={stats.totalTasks}
          description="All tasks across workflows"
          icon={ListTodo}
          trend="+12% from last month"
        />
        <StatCard
          title="Completed Tasks"
          value={stats.completedTasks}
          description={`${Math.round((stats.completedTasks / stats.totalTasks) * 100)}% completion rate`}
          icon={CheckCircle2}
          trend="+8% from last month"
        />
        <StatCard
          title="Overdue Tasks"
          value={stats.overdueTasks}
          description="Tasks past due date"
          icon={AlertCircle}
        />
        <StatCard
          title="Due Today"
          value={stats.tasksDueToday}
          description="Tasks due by end of day"
          icon={Clock}
        />
        <StatCard
          title="Avg Completion Time"
          value={stats.avgCompletionTime}
          description="Average time to complete"
          icon={TrendingUp}
        />
        <StatCard
          title="Active Workflows"
          value={stats.activeWorkflows}
          description="Workflows in use"
          icon={Users}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
            <CardDescription>Your most recent task updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Implement user authentication</p>
                  <p className="text-xs text-muted-foreground">Updated 2 hours ago</p>
                </div>
                <Badge>In Progress</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Design dashboard mockups</p>
                  <p className="text-xs text-muted-foreground">Updated 5 hours ago</p>
                </div>
                <Badge variant="secondary">Done</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Fix API endpoint bugs</p>
                  <p className="text-xs text-muted-foreground">Updated 1 day ago</p>
                </div>
                <Badge variant="destructive">Overdue</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-accent transition-colors">
                <p className="text-sm font-medium">Create New Task</p>
                <p className="text-xs text-muted-foreground">Add a task to your workflow</p>
              </button>
              <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-accent transition-colors">
                <p className="text-sm font-medium">View All Tasks</p>
                <p className="text-xs text-muted-foreground">See your task board</p>
              </button>
              <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-accent transition-colors">
                <p className="text-sm font-medium">Manage Workflows</p>
                <p className="text-xs text-muted-foreground">Configure your workflows</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
