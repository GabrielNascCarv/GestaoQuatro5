import { TaskStatus } from '../../../entities/task';

export interface CreateTaskInput {
  title: string;
  description?: string;
  score: number;
  created_by_id: string;
}

export interface CreateTaskOutput {
  id: string;
  title: string;
  description: string | null;
  score: number;
  status: TaskStatus;
  assigned_to_id: string | null;
  created_by_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateTaskUseCase {
  execute(data: CreateTaskInput): Promise<CreateTaskOutput>;
}
