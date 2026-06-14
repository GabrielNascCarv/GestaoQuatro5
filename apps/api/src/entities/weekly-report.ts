import { Task } from './task';

export class WeeklyReport {
  id!: string;
  week_name!: string;
  closed_at!: Date;
  total_tasks!: number;
  completed_tasks!: number;
  total_score!: number;
  completed_score!: number;
  tasks?: Task[];
  created_at!: Date;
  updated_at!: Date;
  deleted_at?: Date | null;

  constructor(props: Omit<WeeklyReport, 'id' | 'closed_at' | 'created_at' | 'updated_at' | 'deleted_at'> & Partial<WeeklyReport>) {
    Object.assign(this, props);
  }
}
