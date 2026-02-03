'use client';

import { useState } from 'react';
import { useCreateWorkflowMutation } from '@/store/api/workflowApi';
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
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';

interface WorkflowFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface StageForm {
  name: string;
  description: string;
  color: string;
}

const defaultColors = [
  '#6B7280', // Gray
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
];

export function WorkflowFormDialog({ open, onOpenChange }: WorkflowFormDialogProps) {
  const [createWorkflow, { isLoading }] = useCreateWorkflowMutation();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isDefault: false,
  });

  const [stages, setStages] = useState<StageForm[]>([
    { name: 'To Do', description: 'Tasks to be started', color: defaultColors[0] },
    { name: 'In Progress', description: 'Tasks being worked on', color: defaultColors[1] },
    { name: 'Done', description: 'Completed tasks', color: defaultColors[2] },
  ]);

  const handleAddStage = () => {
    setStages([
      ...stages,
      {
        name: '',
        description: '',
        color: defaultColors[stages.length % defaultColors.length],
      },
    ]);
  };

  const handleRemoveStage = (index: number) => {
    if (stages.length <= 2) {
      toast.error('Workflow must have at least 2 stages');
      return;
    }
    setStages(stages.filter((_, i) => i !== index));
  };

  const handleStageChange = (index: number, field: keyof StageForm, value: string) => {
    const newStages = [...stages];
    newStages[index] = { ...newStages[index], [field]: value };
    setStages(newStages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Workflow name is required');
      return;
    }

    if (stages.some((s) => !s.name.trim())) {
      toast.error('All stages must have a name');
      return;
    }

    try {
      await createWorkflow({
        name: formData.name,
        description: formData.description || undefined,
        isDefault: formData.isDefault,
        stages: stages.map((stage, index) => ({
          name: stage.name,
          description: stage.description || undefined,
          order: index,
          color: stage.color,
        })),
      }).unwrap();

      toast.success('Workflow created successfully');
      onOpenChange(false);
      resetForm();
    } catch (error: unknown) {
      console.error('Error creating workflow:', error);
      
      // Extract error message from backend response
      let errorMessage = 'Failed to create workflow';
      
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
      name: '',
      description: '',
      isDefault: false,
    });
    setStages([
      { name: 'To Do', description: 'Tasks to be started', color: defaultColors[0] },
      { name: 'In Progress', description: 'Tasks being worked on', color: defaultColors[1] },
      { name: 'Done', description: 'Completed tasks', color: defaultColors[2] },
    ]);
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Workflow</DialogTitle>
          <DialogDescription>
            Define a workflow with custom stages for your tasks.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Workflow Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Workflow Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Software Development"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                placeholder="Describe this workflow (optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isLoading}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                disabled={isLoading}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="isDefault" className="cursor-pointer">
                Set as default workflow
              </Label>
            </div>
          </div>

          {/* Stages */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Stages <span className="text-destructive">*</span></Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddStage}
                disabled={isLoading}
              >
                <Plus className="mr-1 h-3 w-3" />
                Add Stage
              </Button>
            </div>

            <div className="space-y-3">
              {stages.map((stage, index) => (
                <div key={index} className="flex gap-2 items-start p-3 border rounded-lg">
                  <div className="flex-1 space-y-3">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          placeholder="Stage name"
                          value={stage.name}
                          onChange={(e) => handleStageChange(index, 'name', e.target.value)}
                          disabled={isLoading}
                          required
                        />
                      </div>
                      <div className="w-20">
                        <Input
                          type="color"
                          value={stage.color}
                          onChange={(e) => handleStageChange(index, 'color', e.target.value)}
                          disabled={isLoading}
                          className="h-10 cursor-pointer"
                        />
                      </div>
                    </div>
                    <Input
                      placeholder="Description (optional)"
                      value={stage.description}
                      onChange={(e) => handleStageChange(index, 'description', e.target.value)}
                      disabled={isLoading}
                    />
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Order: {index + 1}
                      </Badge>
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: stage.color }}
                      />
                    </div>
                  </div>
                  {stages.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveStage(index)}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Workflow'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
