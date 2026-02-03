'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useGetWorkflowsQuery } from '@/store/api/workflowApi';
import { WorkflowFormDialog } from '@/components/workflows/WorkflowFormDialog';
import { WorkflowEditDialog } from '@/components/workflows/WorkflowEditDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Workflow as WorkflowIcon, Plus } from 'lucide-react';
import type { Workflow } from '@/types';

export default function WorkflowsPage() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const canCreateWorkflow = userRole === 'admin' || userRole === 'manager';

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { data: workflowsData, isLoading } = useGetWorkflowsQuery();

  const handleWorkflowClick = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setIsDetailOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Workflows</h2>
          <p className="text-muted-foreground">Manage your task workflows</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-[150px]" />
                <Skeleton className="h-4 w-[200px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const workflows = workflowsData?.data || [];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Workflows</h2>
          <p className="text-sm md:text-base text-muted-foreground">View and manage your task workflows</p>
        </div>
        {canCreateWorkflow && (
          <Button onClick={() => setIsFormOpen(true)} className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            New Workflow
          </Button>
        )}
      </div>

      {/* Workflows Grid */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {workflows.map((workflow) => (
          <Card
            key={workflow._id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleWorkflowClick(workflow)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <WorkflowIcon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{workflow.name}</CardTitle>
                </div>
                {workflow.isDefault && (
                  <Badge variant="secondary" className="text-xs">
                    Default
                  </Badge>
                )}
              </div>
              {workflow.description && (
                <CardDescription className="line-clamp-2">{workflow.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-2">Stages ({workflow.stages.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {workflow.stages.map((stage) => (
                      <Badge
                        key={stage._id}
                        variant="outline"
                        className="text-xs"
                        style={{
                          borderColor: stage.color,
                          color: stage.color,
                        }}
                      >
                        {stage.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {workflows.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <WorkflowIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No workflows found</p>
          </CardContent>
        </Card>
      )}

      {/* Workflow Form Dialog */}
      <WorkflowFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} />

      {/* Workflow Edit Dialog */}
      <WorkflowEditDialog
        workflow={selectedWorkflow}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  );
}
