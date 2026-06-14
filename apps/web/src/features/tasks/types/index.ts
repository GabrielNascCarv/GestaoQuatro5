export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  score: number;
  status: TaskStatus;
  assigned_to_id: string | null;
  created_by_id: string;
  due_date?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  score: number;
  created_by_id: string;
  due_date?: string | null;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string | null;
  score?: number;
  status?: TaskStatus;
  assigned_to_id?: string | null;
  due_date?: string | null;
}

export interface WorkloadItem {
  userId: string;
  userName: string;
  userEmail: string;
  taskCount: number;
  totalScore: number;
  completedTaskCount: number;
  completedTotalScore: number;
}

export interface CriticalTaskItem {
  id: string;
  title: string;
  score: number;
  status: TaskStatus;
  due_date: string;
  assigned_to: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface TaskMetrics {
  flowStatus: {
    TODO: number;
    IN_PROGRESS: number;
    IN_REVIEW: number;
    COMPLETED: number;
  };
  workload: WorkloadItem[];
  criticalDeadlines: CriticalTaskItem[];
  weeklyVelocity: {
    currentWeekScore: number;
    previousWeekScore: number;
  };
}
