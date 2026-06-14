import { IGetWeeklyReportUseCase, WeeklyReportDetailOutput } from '../../contracts/usecase/weekly-report/get-weekly-report-usecase';
import { IWeeklyReportRepository } from '../../contracts/repository/weekly-report-repository';

export class GetWeeklyReportUseCase implements IGetWeeklyReportUseCase {
  constructor(private readonly weeklyReportRepository: IWeeklyReportRepository) {}

  async execute(id: string): Promise<WeeklyReportDetailOutput> {
    const report = await this.weeklyReportRepository.findById(id);

    if (!report) {
      throw new Error('Relatório semanal não encontrado.');
    }

    return {
      id: report.id,
      week_name: report.week_name,
      closed_at: report.closed_at,
      total_tasks: report.total_tasks,
      completed_tasks: report.completed_tasks,
      total_score: report.total_score,
      completed_score: report.completed_score,
      tasks: (report.tasks || []).map((task) => ({
        id: task.id,
        title: task.title,
        score: task.score,
        status: task.status,
        due_date: task.due_date || null,
        completed_at: task.completed_at || null,
        assigned_to: task.assigned_to || null,
      })),
    };
  }
}
