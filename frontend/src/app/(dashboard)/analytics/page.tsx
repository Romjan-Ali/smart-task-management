'use client';

import { useGetWorkflowEfficiencyQuery, useGetUserPerformanceQuery } from '@/store/api/analyticsApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Users, Clock, Target } from 'lucide-react';

export default function AnalyticsPage() {
  const { data: workflowData, isLoading: workflowLoading } = useGetWorkflowEfficiencyQuery({});
  const { data: userPerfData, isLoading: userPerfLoading } = useGetUserPerformanceQuery({});

  const workflows = workflowData?.data || [];
  const userPerformance = userPerfData?.data || [];

  const formatTime = (ms: number) => {
    // Handle invalid or missing data
    if (!ms || ms <= 0) return 'N/A';
    
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return 'N/A';
  };

  if (workflowLoading || userPerfLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">Performance metrics and insights</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-37.5" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
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
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Analytics</h2>
        <p className="text-sm md:text-base text-muted-foreground">Performance metrics and insights</p>
      </div>

      {/* Workflow Efficiency */}
      <div>
        <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Workflow Efficiency</h3>
        <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2">
          {workflows.map((workflow) => (
            <Card key={workflow.workflowId}>
              <CardHeader>
                <CardTitle className="text-lg">{workflow.workflowName}</CardTitle>
                <CardDescription>
                  {workflow.completedTasks} of {workflow.totalTasks} tasks completed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Completion Rate</p>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      <span className="text-2xl font-bold">{workflow.completionRate.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Avg Time</p>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-2xl font-bold">
                        {formatTime(workflow.avgCompletionTime)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stage Distribution */}
                <div className="space-y-2">
                  <p className="text-xs font-medium">Stage Distribution</p>
                  <div className="flex flex-wrap gap-2">
                    {workflow.stageDistribution.map((stage) => (
                      <Badge key={stage.stageId} variant="outline" className="text-xs">
                        {stage.stageName}: {stage.count}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* User Performance */}
      <div>
        <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">User Performance</h3>
        <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {userPerformance.map((user) => (
            <Card key={user.userId}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">{user.userName}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Assigned</p>
                    <p className="text-xl font-bold">{user.tasksAssigned}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Completed</p>
                    <p className="text-xl font-bold">{user.tasksCompleted}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Rate</p>
                    <p className="text-xl font-bold">{user.completionRate.toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Overdue</p>
                    <p className="text-xl font-bold text-destructive">{user.overdueCount}</p>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Avg Completion Time</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {formatTime(user.avgCompletionTime)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {workflows.length === 0 && userPerformance.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No analytics data available yet</p>
            <p className="text-sm text-muted-foreground">Create some tasks to see analytics</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
