'use client';

import { useState, useEffect, useMemo } from 'react';
import { useCreateTaskMutation, useUpdateTaskMutation } from '@/store/api/taskApi';
import { useGetWorkflowsQuery } from '@/store/api/workflowApi';
import { useGetUsersQuery } from '@/store/api/userApi';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';
import { toast } from 'sonner';
import type { Task, TaskPriority, User } from '@/types';

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  initialTask?: Task;
  defaultWorkflowId?: string;
}

export function TaskFormDialog({ open, onOpenChange, task, initialTask, defaultWorkflowId }: TaskFormDialogProps) {
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const { data: workflowsData } = useGetWorkflowsQuery();
  const { data: usersData } = useGetUsersQuery();

  const editingTask = task || initialTask;
  const isEditing = !!editingTask;
  const isLoading = isCreating || isUpdating;

  // Initialize form data based on task or defaults
  const initialFormData = useMemo(() => {
    if (editingTask) {
      // Extract assigned user IDs
      const assignedUserIds = editingTask.assignedTo.map((user) =>
        typeof user === 'string' ? user : user._id
      );
      
      return {
        title: editingTask.title,
        description: editingTask.description || '',
        priority: editingTask.priority,
        workflowId: typeof editingTask.workflow === 'string' ? editingTask.workflow : editingTask.workflow._id,
        assignedTo: assignedUserIds,
        dueDate: editingTask.dueDate ? new Date(editingTask.dueDate).toISOString().split('T')[0] : '',
      };
    }
    return {
      title: '',
      description: '',
      priority: 'medium' as TaskPriority,
      workflowId: defaultWorkflowId || workflowsData?.data?.[0]?._id || '',
      assignedTo: [] as string[],
      dueDate: '',
    };
  }, [editingTask, defaultWorkflowId, workflowsData]);

  const [formData, setFormData] = useState(initialFormData);

  // Update form data when initial data changes
  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!formData.workflowId) {
      toast.error('Workflow is required');
      return;
    }

    try {
      // Convert date to ISO format if provided
      const dueDateISO = formData.dueDate
        ? new Date(formData.dueDate + 'T00:00:00.000Z').toISOString()
        : undefined;

      if (isEditing && editingTask) {
        await updateTask({
          id: editingTask._id,
          data: {
            title: formData.title,
            description: formData.description || undefined,
            priority: formData.priority,
            assignedTo: formData.assignedTo.length > 0 ? formData.assignedTo : undefined,
            dueDate: dueDateISO,
          },
        }).unwrap();
        toast.success('Task updated successfully');
      } else {
        await createTask({
          title: formData.title,
          description: formData.description || undefined,
          priority: formData.priority,
          workflowId: formData.workflowId,
          assignedTo: formData.assignedTo.length > 0 ? formData.assignedTo : undefined,
          dueDate: dueDateISO,
        }).unwrap();
        toast.success('Task created successfully');
      }

      onOpenChange(false);
      resetForm();
    } catch (error: unknown) {
      console.error('Error saving task:', error);
      
      // Extract error message from backend response
      let errorMessage = isEditing ? 'Failed to update task' : 'Failed to create task';
      
      if (error && typeof error === 'object') {
        if ('data' in error) {
          const errorData = error.data as { error?: string; details?: Array<{ field: string; message: string }> };
          
          if (errorData.details && errorData.details.length > 0) {
            // Show validation errors
            errorMessage = errorData.details.map(d => `${d.field}: ${d.message}`).join(', ');
          } else if (errorData.error) {
            // Show general error
            errorMessage = errorData.error;
          }
        } else if ('message' in error) {
          errorMessage = (error as { message: string }).message;
        }
      }
      
      toast.error(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      workflowId: defaultWorkflowId || workflowsData?.data?.[0]?._id || '',
      assignedTo: [],
      dueDate: '',
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update task details below.' : 'Fill in the details to create a new task.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Enter task title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={isLoading}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description
              <span className="text-xs text-muted-foreground ml-2">(Markdown supported)</span>
            </Label>
            <textarea
              id="description"
              placeholder="Enter task description (optional). Supports **bold**, *italic*, lists, etc."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isLoading}
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value: TaskPriority) => setFormData({ ...formData, priority: value })}
              disabled={isLoading}
            >
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Workflow */}
          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="workflow">
                Workflow <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.workflowId}
                onValueChange={(value) => setFormData({ ...formData, workflowId: value })}
                disabled={isLoading}
              >
                <SelectTrigger id="workflow">
                  <SelectValue placeholder="Select workflow" />
                </SelectTrigger>
                <SelectContent>
                  {workflowsData?.data?.map((workflow) => (
                    <SelectItem key={workflow._id} value={workflow._id}>
                      {workflow.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Assign Users */}
          <div className="space-y-2">
            <Label htmlFor="assignedTo">Assign To</Label>
            <MultiSelect
              options={
                usersData?.data?.map((user) => ({
                  label: `${user.name} (${user.email})`,
                  value: user._id,
                })) || []
              }
              selected={formData.assignedTo}
              onChange={(selected) => setFormData({ ...formData, assignedTo: selected })}
              placeholder="Select users to assign..."
              disabled={isLoading}
            />
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
