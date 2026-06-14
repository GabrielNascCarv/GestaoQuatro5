import { prisma } from '@gestao-quatro5/database';
import { IListWeeklyReportsUseCase, WeeklyReportOutputItem } from '../../contracts/usecase/task/list-weekly-reports-usecase';
import { ITaskRepository } from '../../contracts/repository/task-repository';

export class ListWeeklyReportsUseCase implements IListWeeklyReportsUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(): Promise<WeeklyReportOutputItem[]> {
    const list = await prisma.weeklyReport.findMany({
      orderBy: { closed_at: 'desc' }
    });

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
