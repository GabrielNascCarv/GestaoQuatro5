import { IListWeeklyReportsUseCase, WeeklyReportOutputItem } from '../../contracts/usecase/weekly-report/list-weekly-reports-usecase';
import { IWeeklyReportRepository } from '../../contracts/repository/weekly-report-repository';

export class ListWeeklyReportsUseCase implements IListWeeklyReportsUseCase {
  constructor(private readonly weeklyReportRepository: IWeeklyReportRepository) {}

  async execute(): Promise<WeeklyReportOutputItem[]> {
    const list = await this.weeklyReportRepository.findAll();

    return list.map((report) => ({
      id: report.id,
      week_name: report.week_name,
      closed_at: report.closed_at,
      total_tasks: report.total_tasks,
      completed_tasks: report.completed_tasks,
      total_score: report.total_score,
      completed_score: report.completed_score,
    }));
  }
}
