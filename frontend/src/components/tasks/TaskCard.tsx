import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import type { Task, User as UserType } from '@/types';

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
}

export function TaskCard({ task, isDragging }: TaskCardProps) {
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

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completedAt;

  return (
    <Card
      className={`cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md ${
        isDragging ? 'opacity-50 rotate-2' : ''
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-sm line-clamp-2">{task.title}</h4>
          <Badge variant={getPriorityColor(task.priority)} className="shrink-0">
            {task.priority}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
        )}

        {/* Due Date */}
        {task.dueDate && (
          <div className="flex items-center gap-2 text-xs">
            <Calendar className="h-3 w-3" />
            <span className={isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'}>
              {format(new Date(task.dueDate), 'MMM d, yyyy')}
              {isOverdue && ' (Overdue)'}
            </span>
          </div>
        )}

        {/* Assigned Users */}
        {task.assignedTo && task.assignedTo.length > 0 && (
          <div className="flex items-center gap-2">
            <User className="h-3 w-3 text-muted-foreground" />
            <div className="flex -space-x-2">
              {task.assignedTo.slice(0, 3).map((user, index) => {
                const userName = typeof user === 'string' ? 'U' : user.name;
                return (
                  <Avatar key={index} className="h-6 w-6 border-2 border-background">
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      {getInitials(userName)}
                    </AvatarFallback>
                  </Avatar>
                );
              })}
              {task.assignedTo.length > 3 && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-xs">
                  +{task.assignedTo.length - 3}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
