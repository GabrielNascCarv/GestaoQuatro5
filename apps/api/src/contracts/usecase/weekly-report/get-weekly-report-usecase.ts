import { TaskStatus } from '../../../entities/task';

export interface WeeklyReportDetailOutput {
  id: string;
  week_name: string;
  closed_at: Date;
  total_tasks: number;
  completed_tasks: number;
  total_score: number;
  completed_score: number;
  tasks: Array<{
    id: string;
    title: string;
    score: number;
    status: TaskStatus;
    due_date: Date | null;
    completed_at: Date | null;
    assigned_to: {
      id: string;
      name: string;
      email: string;
    } | null;
  }>;
}

export interface IGetWeeklyReportUseCase {
  execute(id: string): Promise<WeeklyReportDetailOutput>;
}
