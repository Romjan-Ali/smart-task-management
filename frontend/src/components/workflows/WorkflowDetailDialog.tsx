'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
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
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar, User, Edit, Trash2, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { Workflow } from '@/types';

interface WorkflowDetailDialogProps {
  workflow: Workflow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WorkflowDetailDialog({ workflow, open, onOpenChange }: WorkflowDetailDialogProps) {
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const canEdit = userRole === 'admin' || userRole === 'manager';

  const [isEditing, setIsEditing] = useState(false);
  const [updateWorkflow, { isLoading: isUpdating }] = useUpdateWorkflowMutation();
  const [deleteWorkflow, { isLoading: isDeleting }] = useDeleteWorkflowMutation();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  if (!workflow) return null;

  const creatorName = typeof workflow.createdBy === 'string' 
    ? 'Unknown' 
    : workflow.createdBy.name;

  const handleEdit = () => {
    setFormData({
      name: workflow.name,
      description: workflow.description || '',
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Workflow name is required');
      return;
    }

    try {
      await updateWorkflow({
        id: workflow._id,
        data: {
          name: formData.name,
          description: formData.description || undefined,
        },
      }).unwrap();

      toast.success('Workflow updated successfully');
      setIsEditing(false);
    } catch (error: unknown) {
      console.error('Error updating workflow:', error);
      
      let errorMessage = 'Failed to update workflow';
      if (error && typeof error === 'object' && 'data' in error) {
        const errorData = error.data as { error?: string };
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      }
      
      toast.error(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this workflow? This action cannot be undone.')) {
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

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: workflow.name,
      description: workflow.description || '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto" showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Workflow Name</Label>
                    <Input
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={isUpdating}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <textarea
                      id="edit-description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      disabled={isUpdating}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <DialogTitle className="text-2xl">{workflow.name}</DialogTitle>
                    {workflow.isDefault && (
                      <Badge variant="secondary">Default</Badge>
                    )}
                  </div>
                  {workflow.description && (
                    <DialogDescription className="text-base mt-2">
                      {workflow.description}
                    </DialogDescription>
                  )}
                </>
              )}
            </div>

            {/* Action Buttons */}
            {canEdit && !workflow.isDefault && (
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isUpdating}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={isUpdating}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleEdit}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Workflow Info */}
          {!isEditing && (
            <>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Created by:</span>
                  <span className="font-medium">{creatorName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium">
                    {format(new Date(workflow.createdAt), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>

              <Separator />
            </>
          )}

          {/* Stages */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Workflow Stages ({workflow.stages.length})</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {workflow.stages.map((stage, index) => (
                <Card key={stage._id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Order Badge */}
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                        {index + 1}
                      </div>

                      {/* Stage Info */}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{stage.name}</h4>
                          <div
                            className="h-3 w-3 rounded-full border"
                            style={{ backgroundColor: stage.color }}
                          />
                        </div>
                        {stage.description && (
                          <p className="text-sm text-muted-foreground">{stage.description}</p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Order: {stage.order}</span>
                          <span>•</span>
                          <span>Color: {stage.color}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Stage Flow Visualization */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Stage Flow:</h4>
            <div className="flex items-center gap-2 flex-wrap">
              {workflow.stages.map((stage, index) => (
                <div key={stage._id} className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    style={{
                      borderColor: stage.color,
                      color: stage.color,
                    }}
                  >
                    {stage.name}
                  </Badge>
                  {index < workflow.stages.length - 1 && (
                    <span className="text-muted-foreground">→</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {workflow.isDefault && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              ℹ️ This is a default workflow and cannot be edited or deleted.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
