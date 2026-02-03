'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUpdateWorkflowMutation, useDeleteWorkflowMutation } from '@/store/api/workflowApi';
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
import { Plus, X, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import type { Workflow } from '@/types';

interface WorkflowEditDialogProps {
  workflow: Workflow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface StageForm {
  _id?: string;
  name: string;
  description: string;
  color: string;
  order: number;
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

export function WorkflowEditDialog({ workflow, open, onOpenChange }: WorkflowEditDialogProps) {
  const [updateWorkflow, { isLoading: isUpdating }] = useUpdateWorkflowMutation();
  const [deleteWorkflow, { isLoading: isDeleting }] = useDeleteWorkflowMutation();

  const [formData, setFormData] = useState({
    name: workflow?.name || '',
    description: workflow?.description || '',
  });

  const [stages, setStages] = useState<StageForm[]>(
    workflow?.stages.map((stage, index) => ({
      _id: stage._id,
      name: stage.name,
      description: stage.description || '',
      color: stage.color,
      order: index,
    })) || []
  );

  // Reset form when workflow or open state changes
  useEffect(() => {
    if (workflow && open) {
      setFormData({
        name: workflow.name,
        description: workflow.description || '',
      });
      setStages(
        workflow.stages.map((stage, index) => ({
          _id: stage._id,
          name: stage.name,
          description: stage.description || '',
          color: stage.color,
          order: index,
        }))
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflow?._id, open]); // Only re-run when workflow ID or open state changes

  if (!workflow) return null;

  const handleAddStage = () => {
    setStages([
      ...stages,
      {
        name: '',
        description: '',
        color: defaultColors[stages.length % defaultColors.length],
        order: stages.length,
      },
    ]);
  };

  const handleRemoveStage = (index: number) => {
    if (stages.length <= 2) {
      toast.error('Workflow must have at least 2 stages');
      return;
    }
    setStages(stages.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i })));
  };

  const handleStageChange = (index: number, field: keyof StageForm, value: string) => {
    const newStages = [...stages];
    newStages[index] = { ...newStages[index], [field]: value };
    setStages(newStages);
  };

  const moveStage = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= stages.length) return;
    const updated = [...stages];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setStages(updated.map((s, i) => ({ ...s, order: i })));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Workflow name is required');
      return;
    }

    if (stages.some((s) => !s.name.trim())) {
      toast.error('All stages must have a name');
      return;
    }

    try {
      await updateWorkflow({
        id: workflow._id,
        data: {
          name: formData.name,
          description: formData.description || undefined,
          stages: stages.map((stage, index) => ({
            name: stage.name,
            description: stage.description || undefined,
            order: index,
            color: stage.color,
          })),
        },
      }).unwrap();

      toast.success('Workflow updated successfully');
      onOpenChange(false);
    } catch (error: unknown) {
      console.error('Error updating workflow:', error);
      
      let errorMessage = 'Failed to update workflow';
      if (error && typeof error === 'object' && 'data' in error) {
        const errorData = error.data as { error?: string; details?: Array<{ field: string; message: string }> };
        if (errorData.details && errorData.details.length > 0) {
          errorMessage = errorData.details.map(d => `${d.field}: ${d.message}`).join(', ');
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      }
      
      toast.error(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${workflow.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteWorkflow(workflow._id).unwrap();
      toast.success('Workflow deleted successfully');
      onOpenChange(false);
    } catch (error: unknown) {
      console.error('Error deleting workflow:', error);
      
      let errorMessage = 'Failed to delete workflow';
      if (error && typeof error === 'object' && 'data' in error) {
        const errorData = error.data as { error?: string };
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      }
      
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto" showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Edit Workflow</DialogTitle>
              <DialogDescription>
                Update workflow details and stages
              </DialogDescription>
            </div>
            {!workflow.isDefault && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting || isUpdating}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        </DialogHeader>

        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
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
                disabled={isUpdating || workflow.isDefault}
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
                disabled={isUpdating || workflow.isDefault}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              />
            </div>

            {workflow.isDefault && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  ℹ️ This is a default workflow. Only stages can be viewed, not edited.
                </p>
              </div>
            )}
          </div>

          {/* Stages */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Stages <span className="text-destructive">*</span></Label>
              {!workflow.isDefault && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddStage}
                  disabled={isUpdating}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Add Stage
                </Button>
              )}
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {stages.map((stage, index) => (
                <div key={index} className="flex gap-2 items-start p-3 border rounded-lg">
                  <div className="flex-1 space-y-3">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          placeholder="Stage name"
                          value={stage.name}
                          onChange={(e) => handleStageChange(index, 'name', e.target.value)}
                          disabled={isUpdating || workflow.isDefault}
                          required
                        />
                      </div>
                      <div className="w-20">
                        <Input
                          type="color"
                          value={stage.color}
                          onChange={(e) => handleStageChange(index, 'color', e.target.value)}
                          disabled={isUpdating || workflow.isDefault}
                          className="h-10 cursor-pointer"
                        />
                      </div>
                    </div>
                    <Input
                      placeholder="Description (optional)"
                      value={stage.description}
                      onChange={(e) => handleStageChange(index, 'description', e.target.value)}
                      disabled={isUpdating || workflow.isDefault}
                    />
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Order: {index + 1}
                      </Badge>
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: stage.color }}
                      />
                      <div className="ml-auto flex gap-1">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => moveStage(index, 'up')}
                          disabled={isUpdating || workflow.isDefault || index === 0}
                          className="h-8 w-8"
                          aria-label="Move stage up"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => moveStage(index, 'down')}
                          disabled={isUpdating || workflow.isDefault || index === stages.length - 1}
                          className="h-8 w-8"
                          aria-label="Move stage down"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  {!workflow.isDefault && stages.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveStage(index)}
                      disabled={isUpdating}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {!workflow.isDefault && (
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)} 
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
