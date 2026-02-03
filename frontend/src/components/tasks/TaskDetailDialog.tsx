'use client';

import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import type { ComponentProps } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, User, Clock, Edit } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetTaskByIdQuery } from '@/store/api/taskApi';
import type { Task, User as UserType, WorkflowStage } from '@/types';

type CodeProps = ComponentProps<'code'> & { inline?: boolean };

interface TaskDetailDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (task: Task) => void;
}

export function TaskDetailDialog({ task, open, onOpenChange, onEdit }: TaskDetailDialogProps) {
  const { data: session } = useSession();

  const taskId = task?._id;
  const { data: detailData, isLoading: detailLoading } = useGetTaskByIdQuery(taskId as string, {
    skip: !open || !taskId,
  });

  const taskData = detailData?.data || task;

  if (!taskData) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isOverdue = taskData.dueDate && new Date(taskData.dueDate) < new Date() && !taskData.completedAt;

  // Check if user can edit this task
  const canEdit = () => {
    if (!session?.user) return false;
    
    const userRole = session.user.role;
    const userId = session.user.id;
    
    // Admin and Manager can edit all tasks
    if (userRole === 'admin' || userRole === 'manager') return true;
    
    // Members can only edit tasks assigned to them
    if (userRole === 'member') {
      return taskData.assignedTo.some((assignedUser) => {
        const assignedUserId = typeof assignedUser === 'string' ? assignedUser : assignedUser._id;
        return assignedUserId === userId;
      });
    }
    
    return false;
  };

  const currentStage = typeof taskData.currentStage === 'string' 
    ? null 
    : (taskData.currentStage as WorkflowStage);

  const createdBy = typeof taskData.createdBy === 'string' 
    ? null 
    : (taskData.createdBy as UserType);

  const activityLog = taskData.activityLog || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto" showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-xl">{taskData.title}</DialogTitle>
              <DialogDescription className="mt-2">
                Task details and information
              </DialogDescription>
            </div>
            <Badge variant={getPriorityColor(taskData.priority)} className="shrink-0">
              {taskData.priority}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {detailLoading && (
            <div className="space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-20 w-full" />
            </div>
          )}

          {/* Description */}
          {taskData.description && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Description</h4>
              <div className="text-sm text-muted-foreground markdown-content-detail">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    h1: ({ children }) => <h1 className="text-xl font-semibold mb-2 leading-tight">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-lg font-semibold mb-2 leading-tight">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-base font-semibold mb-2 leading-tight">{children}</h3>,
                    hr: () => <hr className="my-3 border-border" />,
                    code: ({ inline, className, children, ...props }: CodeProps) => {
                      const codeText = String(children).replace(/\n$/, '');
                      if (inline) {
                        return (
                          <code
                            className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono"
                            {...props}
                          >
                            {codeText}
                          </code>
                        );
                      }
                      return (
                        <pre className="bg-muted p-3 rounded-md overflow-x-auto my-3">
                          <code className={className} {...props}>
                            {codeText}
                          </code>
                        </pre>
                      );
                    },
                    ul: ({ children }) => <ul className="list-disc list-inside my-2">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside my-2">{children}</ol>,
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-3">
                        <table className="w-full border-collapse text-sm">{children}</table>
                      </div>
                    ),
                    th: ({ children }) => <th className="border border-border px-2 py-1 text-left bg-muted">{children}</th>,
                    td: ({ children }) => <td className="border border-border px-2 py-1 align-top">{children}</td>,
                    a: ({ href, children, ...props }) => (
                      <a
                        href={href}
                        className="text-primary underline hover:opacity-80"
                        target="_blank"
                        rel="noopener noreferrer"
                        {...props}
                      >
                        {children}
                      </a>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-2 border-border pl-3 italic my-3">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {taskData.description}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {/* Current Stage */}
          {currentStage && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Current Stage</h4>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: currentStage.color || '#6B7280' }}
                />
                <span className="text-sm">{currentStage.name}</span>
              </div>
            </div>
          )}

          {/* Due Date */}
          {taskData.dueDate && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Due Date</h4>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                <span className={isOverdue ? 'text-destructive font-medium' : ''}>
                  {format(new Date(taskData.dueDate), 'MMMM d, yyyy')}
                  {isOverdue && ' (Overdue)'}
                </span>
              </div>
            </div>
          )}

          {/* Assigned Users */}
          {taskData.assignedTo && taskData.assignedTo.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Assigned To</h4>
              <div className="flex flex-wrap gap-2">
                {taskData.assignedTo.map((assignedUser, index) => {
                  const userName = typeof assignedUser === 'string' ? 'User' : assignedUser.name;
                  const userEmail = typeof assignedUser === 'string' ? '' : assignedUser.email;
                  
                  return (
                    <div key={index} className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                          {getInitials(userName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-sm">
                        <div className="font-medium">{userName}</div>
                        {userEmail && <div className="text-xs text-muted-foreground">{userEmail}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Created By */}
          {createdBy && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Created By</h4>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                <span>{createdBy.name}</span>
                <span className="text-muted-foreground">({createdBy.email})</span>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold mb-2">Created</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{format(new Date(taskData.createdAt), 'MMM d, yyyy')}</span>
              </div>
            </div>
            {taskData.completedAt && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Completed</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{format(new Date(taskData.completedAt), 'MMM d, yyyy')}</span>
                </div>
              </div>
            )}
          </div>

          {/* Activity Log */}
          {activityLog.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Activity Log</h4>
              <div className="space-y-3">
                {activityLog
                  .slice()
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((entry, idx) => {
                    const performer = typeof entry.performedBy === 'string' ? null : entry.performedBy;
                    const detailText =
                      typeof entry.details === 'string'
                        ? entry.details
                        : entry.details
                        ? JSON.stringify(entry.details)
                        : null;
                    return (
                      <div key={idx} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-primary mt-1" />
                          {idx < activityLog.length - 1 && (
                            <div className="flex-1 w-px bg-border mt-1" />
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium capitalize">{entry.action.replace(/_/g, ' ')}</p>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(entry.timestamp), 'MMM d, yyyy p')}
                            </span>
                          </div>
                          {detailText && (
                            <p className="text-sm text-muted-foreground">{detailText}</p>
                          )}
                          {performer && (
                            <p className="text-xs text-muted-foreground">
                              by {performer.name} ({performer.email})
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {canEdit() && onEdit && (
            <Button onClick={() => {
              onEdit(taskData);
              onOpenChange(false);
            }}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Task
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
