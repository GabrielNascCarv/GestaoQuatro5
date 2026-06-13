import { TaskStatus } from '../../../entities/task';

export interface ListTasksOutputItem {
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

export type ListTasksOutput = ListTasksOutputItem[];

export interface IListTasksUseCase {
  execute(): Promise<ListTasksOutput>;
}
