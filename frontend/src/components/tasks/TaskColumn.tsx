import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Task, WorkflowStage } from '@/types';
import { SortableTaskCard } from './SortableTaskCard';

interface TaskColumnProps {
  stage: WorkflowStage;
  tasks: Task[];
}

export function TaskColumn({ stage, tasks }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage._id,
  });

  return (
    <div className="flex flex-col h-full min-w-[280px] md:min-w-[300px] w-[280px] md:w-[300px]">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 md:mb-4 px-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: stage.color || '#6B7280' }}
          />
          <h3 className="font-semibold text-sm truncate">{stage.name}</h3>
          <Badge variant="secondary" className="text-xs flex-shrink-0">
            {tasks.length}
          </Badge>
        </div>
      </div>

      {/* Tasks Container */}
      <Card
        ref={setNodeRef}
        className={`flex-1 p-2 md:p-3 space-y-2 md:space-y-3 overflow-y-auto transition-colors ${
          isOver ? 'bg-accent/50 border-primary' : ''
        }`}
      >
        <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
              No tasks
            </div>
          ) : (
            tasks.map((task) => <SortableTaskCard key={task._id} task={task} />)
          )}
        </SortableContext>
      </Card>
    </div>
  );
}
