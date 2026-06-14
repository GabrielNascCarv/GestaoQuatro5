import { TaskStatus } from '../../../entities/task';

export interface UpdateTaskInput {
  id: string;
  title?: string;
  description?: string | null;
  score?: number;
  status?: TaskStatus;
  assigned_to_id?: string | null;
  due_date?: string | Date | null;
  completed_at?: Date | null;
}

export interface UpdateTaskOutput {
  id: string;
  title: string;
  description: string | null;
  score: number;
  status: TaskStatus;
  assigned_to_id: string | null;
  created_by_id: string;
  due_date: Date | null;
  completed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface IUpdateTaskUseCase {
  execute(data: UpdateTaskInput): Promise<UpdateTaskOutput>;
}
