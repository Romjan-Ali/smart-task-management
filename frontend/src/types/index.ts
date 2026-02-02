// Type definitions for the frontend application
export type UserRole = 'admin' | 'manager' | 'member';

export type TaskPriority = 'low' | 'medium' | 'high';

export type NotificationType = 
  | 'task_assigned' 
  | 'task_completed' 
  | 'task_stage_changed' 
  | 'task_due_soon' 
  | 'task_overdue'
  | 'mention'
  | 'comment';

// User Types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

// Workflow Types
export interface WorkflowStage {
  _id: string;
  name: string;
  description?: string;
  order: number;
  color: string;
}

export interface Workflow {
  _id: string;
  name: string;
  description?: string;
  stages: WorkflowStage[];
  isDefault: boolean;
  createdBy: string | User;
  createdAt: string;
  updatedAt: string;
}

// Task Types
export interface TaskActivity {
  action: string;
  performedBy: string | User;
  timestamp: string;
  details?: Record<string, unknown>;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  workflow: string | Workflow;
  currentStage: string | WorkflowStage;
  assignedTo: (string | User)[];
  createdBy: string | User;
  dueDate?: string;
  completedAt?: string;
  activityLog: TaskActivity[];
  createdAt: string;
  updatedAt: string;
}

// Notification Types
export interface Notification {
  _id: string;
  recipient: string | User;
  type: NotificationType;
  title: string;
  message: string;
  relatedTask?: string | Task;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

// Analytics Types
export interface TasksByStage {
  stageName: string;
  count: number;
  stageId: string;
}

export interface TasksByPriority {
  priority: TaskPriority;
  count: number;
}

export interface DashboardStats {
  tasksByStage: TasksByStage[];
  tasksByPriority: TasksByPriority[];
  overdueCount: number;
  completedCount: number;
  totalTasks: number;
  avgCompletionTime: number;
  tasksDueToday: number;
  tasksDueThisWeek: number;
}

export interface WorkflowEfficiency {
  workflowId: string;
  workflowName: string;
  totalTasks: number;
  completedTasks: number;
  avgCompletionTime: number;
  stageDistribution: TasksByStage[];
  completionRate: number;
}

export interface UserPerformance {
  userId: string;
  userName: string;
  tasksAssigned: number;
  tasksCompleted: number;
  avgCompletionTime: number;
  overdueCount: number;
  completionRate: number;
  tasksByPriority: TasksByPriority[];
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: User;
}

// Form Types
export interface CreateTaskData {
  title: string;
  description?: string;
  priority: TaskPriority;
  workflowId: string;
  assignedTo?: string[];
  dueDate?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  assignedTo?: string[];
  dueDate?: string;
}

export interface ChangeStageData {
  stageId: string;
}

export interface CreateWorkflowData {
  name: string;
  description?: string;
  isDefault?: boolean;
  stages: {
    name: string;
    description?: string;
    order: number;
    color: string;
  }[];
}

// Query Parameters
export interface TaskQueryParams {
  page?: number;
  limit?: number;
  workflowId?: string;
  stageId?: string;
  assignedTo?: string;
  priority?: TaskPriority;
  overdue?: boolean;
  search?: string;
}

export interface WorkflowQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isDefault?: boolean;
}

export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export interface AnalyticsQueryParams {
  workflowId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}
