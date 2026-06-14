import { TaskStatus } from '../../../entities/task';

export interface ListUserTasksOutputItem {
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

export type ListUserTasksOutput = ListUserTasksOutputItem[];

export interface IListUserTasksUseCase {
  execute(userId: string): Promise<ListUserTasksOutput>;
}
