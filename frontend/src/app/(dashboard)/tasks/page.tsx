'use client';

import { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useGetTasksQuery } from '@/store/api/taskApi';
import { useGetDefaultWorkflowsQuery } from '@/store/api/workflowApi';
import { useChangeTaskStageMutation } from '@/store/api/taskApi';
import { TaskColumn } from '@/components/tasks/TaskColumn';
import { TaskCard } from '@/components/tasks/TaskCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { Task, Workflow, WorkflowStage } from '@/types';

export default function TasksPage() {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);

  // Fetch data
  const { data: tasksData, isLoading: tasksLoading } = useGetTasksQuery();
  const { data: workflowsData, isLoading: workflowsLoading } = useGetDefaultWorkflowsQuery();
  const [changeStage] = useChangeTaskStageMutation();

  // Get selected workflow or first workflow
  const selectedWorkflow = useMemo(() => {
    if (!workflowsData?.data) return null;
    if (selectedWorkflowId) {
      return workflowsData.data.find((w) => w._id === selectedWorkflowId) || workflowsData.data[0];
    }
    return workflowsData.data[0];
  }, [workflowsData, selectedWorkflowId]);

  // Group tasks by stage
  const tasksByStage = useMemo(() => {
    if (!tasksData?.data || !selectedWorkflow) return {};

    const grouped: Record<string, Task[]> = {};
    selectedWorkflow.stages.forEach((stage) => {
      grouped[stage._id] = [];
    });

    tasksData.data.forEach((task) => {
      const stageId = typeof task.currentStage === 'string' ? task.currentStage : task.currentStage._id;
      if (grouped[stageId]) {
        grouped[stageId].push(task);
      }
    });

    return grouped;
  }, [tasksData, selectedWorkflow]);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasksData?.data.find((t) => t._id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || active.id === over.id) return;

    const taskId = active.id as string;
    const newStageId = over.id as string;

    try {
      await changeStage({
        id: taskId,
        data: { stageId: newStageId },
      }).unwrap();

      toast.success('Task moved successfully');
    } catch (error) {
      toast.error('Failed to move task');
    }
  };

  if (tasksLoading || workflowsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="min-w-[300px] space-y-3">
              <Skeleton className="h-6 w-[150px]" />
              <Skeleton className="h-[400px] w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!selectedWorkflow) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <p className="text-muted-foreground">No workflows found. Please create a workflow first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Task Board</h2>
          <p className="text-muted-foreground">
            Workflow: <span className="font-medium">{selectedWorkflow.name}</span>
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      {/* Task Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {selectedWorkflow.stages.map((stage) => (
            <TaskColumn
              key={stage._id}
              stage={stage}
              tasks={tasksByStage[stage._id] || []}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
