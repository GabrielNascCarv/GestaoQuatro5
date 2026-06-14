export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED';

export class Task {
  id!: string;
  title!: string;
  description?: string | null;
  score!: number;
  status!: TaskStatus;
  assigned_to_id?: string | null;
  created_by_id!: string;
  due_date?: Date | null;
  completed_at?: Date | null;
  weekly_report_id?: string | null;
  created_at!: Date;
  updated_at!: Date;
  deleted_at?: Date | null;

  constructor(props: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'status'> & Partial<Task>) {
    Object.assign(this, props);
    this.status = props.status || 'TODO';
  }
}
