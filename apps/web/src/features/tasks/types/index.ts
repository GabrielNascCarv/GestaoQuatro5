export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  score: number;
  status: TaskStatus;
  assigned_to_id: string | null;
  created_by_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  score: number;
  created_by_id: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string | null;
  score?: number;
  status?: TaskStatus;
  assigned_to_id?: string | null;
}
