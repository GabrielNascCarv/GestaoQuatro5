import { TaskStatus } from '../../../entities/task';

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
  due_date: Date;
  assigned_to: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface TaskMetricsOutput {
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

export interface IGetTaskMetricsUseCase {
  execute(): Promise<TaskMetricsOutput>;
}
