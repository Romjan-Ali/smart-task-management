import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskCard } from './TaskCard';
import type { Task } from '@/types';

interface SortableTaskCardProps {
  task: Task;
  onDoubleClick?: (task: Task) => void;
}

export function SortableTaskCard({ task, onDoubleClick }: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} isDragging={isDragging} onDoubleClick={onDoubleClick} />
    </div>
  );
}
