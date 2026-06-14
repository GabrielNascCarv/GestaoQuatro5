import { WeeklyReport } from '../../entities/weekly-report';

export interface IWeeklyReportRepository {
  create(report: WeeklyReport, taskIds: string[]): Promise<WeeklyReport>;
  findAll(): Promise<WeeklyReport[]>;
  findById(id: string): Promise<WeeklyReport | null>;
}
