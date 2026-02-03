import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import type { ComponentProps } from 'react';
import type { Task } from '@/types';

type CodeProps = ComponentProps<'code'> & { inline?: boolean };

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  onDoubleClick?: (task: Task) => void;
}

export function TaskCard({ task, isDragging, onDoubleClick }: TaskCardProps) {
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
      onDoubleClick={() => onDoubleClick?.(task)}
    >
      <CardHeader className="pb-2 md:pb-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-xs md:text-sm line-clamp-2">{task.title}</h4>
          <Badge variant={getPriorityColor(task.priority)} className="shrink-0 text-xs">
            {task.priority}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 md:space-y-3">
        {task.description && (
          <div className="text-xs text-muted-foreground line-clamp-2 markdown-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                h1: ({ children }) => <h1 className="text-sm font-semibold leading-tight">{children}</h1>,
                h2: ({ children }) => <h2 className="text-sm font-semibold leading-tight">{children}</h2>,
                h3: ({ children }) => <h3 className="text-[0.95rem] font-semibold leading-tight">{children}</h3>,
                hr: () => <hr className="my-1 border-border" />,
                code: ({ inline, className, children, ...props }: CodeProps) => {
                  const codeText = String(children).replace(/\n$/, '');
                  if (inline) {
                    return (
                      <code
                        className="bg-muted px-1 py-0.5 rounded text-[0.75rem] font-mono"
                        {...props}
                      >
                        {codeText}
                      </code>
                    );
                  }
                  return (
                    <pre className="bg-muted px-2 py-1.5 rounded-md overflow-x-auto">
                      <code className={className} {...props}>
                        {codeText}
                      </code>
                    </pre>
                  );
                },
                ul: ({ children }) => <ul className="list-disc list-inside">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside">{children}</ol>,
                li: ({ children }) => <li className="ml-1 inline">{children}</li>,
                table: ({ children }) => (
                  <div className="overflow-x-auto">
                    <table className="text-xs border-collapse w-full">{children}</table>
                  </div>
                ),
                th: ({ children }) => <th className="border border-border px-2 py-1 text-left bg-muted">{children}</th>,
                td: ({ children }) => <td className="border border-border px-2 py-1">{children}</td>,
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
              }}
            >
              {task.description}
            </ReactMarkdown>
          </div>
        )}

        {/* Due Date */}
        {task.dueDate && (
          <div className="flex items-center gap-2 text-xs">
            <Calendar className="h-3 w-3 flex-shrink-0" />
            <span className={isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'}>
              {format(new Date(task.dueDate), 'MMM d')}
              {isOverdue && ' (Overdue)'}
            </span>
          </div>
        )}

        {/* Assigned Users */}
        {task.assignedTo && task.assignedTo.length > 0 && (
          <div className="flex items-center gap-2">
            <User className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <div className="flex -space-x-2">
              {task.assignedTo.slice(0, 3).map((user, index) => {
                const userName = typeof user === 'string' ? 'U' : user.name;
                return (
                  <Avatar key={index} className="h-5 w-5 md:h-6 md:w-6 border-2 border-background">
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      {getInitials(userName)}
                    </AvatarFallback>
                  </Avatar>
                );
              })}
              {task.assignedTo.length > 3 && (
                <div className="flex h-5 w-5 md:h-6 md:w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-xs">
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
