import { TaskStatus } from '../../../entities/task';

export interface UpdateTaskInput {
  id: string;
  title?: string;
  description?: string | null;
  score?: number;
  status?: TaskStatus;
  assigned_to_id?: string | null;
}

export interface UpdateTaskOutput {
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

export interface IUpdateTaskUseCase {
  execute(data: UpdateTaskInput): Promise<UpdateTaskOutput>;
}
