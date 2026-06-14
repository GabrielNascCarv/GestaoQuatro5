import { prisma } from '@gestao-quatro5/database';
import { IGetWeeklyReportUseCase, WeeklyReportDetailOutput } from '../../contracts/usecase/task/get-weekly-report-usecase';
import { TaskStatus } from '../../entities/task';
import { ITaskRepository } from '../../contracts/repository/task-repository';

export class GetWeeklyReportUseCase implements IGetWeeklyReportUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(id: string): Promise<WeeklyReportDetailOutput> {
    const report = await prisma.weeklyReport.findUnique({
      where: { id },
      include: {
        tasks: {
          include: {
            assigned_to: true,
          },
        },
      },
    });

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
      tasks: report.tasks.map((task) => ({
        id: task.id,
        title: task.title,
        score: task.score,
        status: task.status as TaskStatus,
        due_date: task.due_date,
        completed_at: task.completed_at,
        assigned_to: task.assigned_to
          ? {
              id: task.assigned_to.id,
              name: task.assigned_to.name,
              email: task.assigned_to.email,
            }
          : null,
      })),
    };
  }
}
