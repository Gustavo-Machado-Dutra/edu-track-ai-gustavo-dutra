export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  timezone: string;
  notificationsEnabled: boolean;
}

export interface Subject {
  id: string;
  name: string;
  professor?: string;
  workloadHours?: string;
  description?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  subject: Subject;
  status: TaskStatus;
  priority: TaskPriority;
  difficulty?: TaskDifficulty;
  dueDate?: string;
  estimatedMinutes?: number;
  completedAt?: string;
  createdAt: string;
}

export interface StudySession {
  id: string;
  subjectId: string;
  taskId?: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds?: number;
  subject: Subject;
  task?: Task;
}

export interface ApiResponse<T> {
  data: T;
  error?: {
    statusCode: number;
    message: string;
  };
}

export interface TaskHistory {
  id: string;
  taskId: string;
  fromStatus?: TaskStatus;
  toStatus?: TaskStatus;
  fromPriority?: TaskPriority;
  toPriority?: TaskPriority;
  fromDueDate?: string;
  toDueDate?: string;
  changedAt: string;
}
