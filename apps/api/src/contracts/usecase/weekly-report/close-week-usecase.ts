export interface CloseWeekOutput {
  id: string;
  week_name: string;
  closed_at: Date;
  total_tasks: number;
  completed_tasks: number;
  total_score: number;
  completed_score: number;
}

export interface ICloseWeekUseCase {
  execute(): Promise<CloseWeekOutput>;
}
