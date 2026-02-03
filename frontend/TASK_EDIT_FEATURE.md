# Task Edit Feature - Double-Click Implementation

## Overview
Implemented double-click to edit task feature for the task board. Users can now double-click on any task card to open the edit dialog.

## Changes Made

### 1. TaskCard Component
**File:** `frontend/src/components/tasks/TaskCard.tsx`

- Added `onDoubleClick` prop to TaskCardProps interface
- Added `onDoubleClick` handler to Card component
- Calls the callback when user double-clicks on the task card

```typescript
interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  onDoubleClick?: (task: Task) => void;
}

// In JSX:
<Card
  className={...}
  onDoubleClick={() => onDoubleClick?.(task)}
>
```

### 2. SortableTaskCard Component
**File:** `frontend/src/components/tasks/SortableTaskCard.tsx`

- Added `onDoubleClick` prop to SortableTaskCardProps interface
- Passes the callback through to TaskCard component

```typescript
interface SortableTaskCardProps {
  task: Task;
  onDoubleClick?: (task: Task) => void;
}

// In JSX:
<TaskCard task={task} isDragging={isDragging} onDoubleClick={onDoubleClick} />
```

### 3. TaskColumn Component
**File:** `frontend/src/components/tasks/TaskColumn.tsx`

- Added `onTaskDoubleClick` prop to TaskColumnProps interface
- Passes the callback to each SortableTaskCard

```typescript
interface TaskColumnProps {
  stage: WorkflowStage;
  tasks: Task[];
  onTaskDoubleClick?: (task: Task) => void;
}

// In JSX:
tasks.map((task) => <SortableTaskCard key={task._id} task={task} onDoubleClick={onTaskDoubleClick} />)
```

### 4. Tasks Page
**File:** `frontend/src/app/(dashboard)/tasks/page.tsx`

- Added `editingTask` state to track which task is being edited
- Created `handleTaskDoubleClick` function to set editing task and open form
- Passes callback to TaskColumn components
- Updated TaskFormDialog to accept `initialTask` prop
- Clears editing task when dialog closes

```typescript
const [editingTask, setEditingTask] = useState<Task | null>(null);

const handleTaskDoubleClick = (task: Task) => {
  setEditingTask(task);
  setIsFormOpen(true);
};

// In JSX:
<TaskColumn
  key={stage._id}
  stage={stage}
  tasks={tasksByStage[stage._id] || []}
  onTaskDoubleClick={handleTaskDoubleClick}
/>

<TaskFormDialog
  open={isFormOpen}
  onOpenChange={(open) => {
    setIsFormOpen(open);
    if (!open) setEditingTask(null);
  }}
  defaultWorkflowId={selectedWorkflow._id}
  initialTask={editingTask || undefined}
/>
```

### 5. TaskFormDialog Component
**File:** `frontend/src/components/tasks/TaskFormDialog.tsx`

- Added `initialTask` prop to TaskFormDialogProps interface
- Updated logic to use either `task` or `initialTask` for editing
- Renamed internal variable to `editingTask` for clarity
- Updated form reset logic to always reset on close

```typescript
interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  initialTask?: Task;
  defaultWorkflowId?: string;
}

const editingTask = task || initialTask;
const isEditing = !!editingTask;
```

## User Experience

### Before
- Users had to click a button or menu to edit tasks
- No intuitive way to quickly edit task details

### After
- Users can double-click any task card to open edit dialog
- Smooth, intuitive editing experience
- Form pre-fills with existing task data
- Dialog closes and clears state after successful update

## Testing Checklist

- [x] Double-click on task card opens edit dialog
- [x] Form pre-fills with task data
- [x] Can update task title, description, priority, due date
- [x] Dialog closes after successful update
- [x] Editing state clears when dialog closes
- [x] Works across all workflow stages
- [x] Works on mobile and desktop

## Files Modified

1. `frontend/src/components/tasks/TaskCard.tsx`
2. `frontend/src/components/tasks/SortableTaskCard.tsx`
3. `frontend/src/components/tasks/TaskColumn.tsx`
4. `frontend/src/app/(dashboard)/tasks/page.tsx`
5. `frontend/src/components/tasks/TaskFormDialog.tsx`

## Related Features

- Task creation via "New Task" button
- Task drag & drop between stages
- Task deletion via context menu
- Task filtering and search
