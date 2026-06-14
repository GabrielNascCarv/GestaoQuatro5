import { prisma } from '@gestao-quatro5/database';
import { ICloseWeekUseCase, CloseWeekOutput } from '../../contracts/usecase/task/close-week-usecase';
import { ITaskRepository } from '../../contracts/repository/task-repository';

export class CloseWeekUseCase implements ICloseWeekUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(): Promise<CloseWeekOutput> {
    const report = await prisma.$transaction(async (tx) => {
      // 1. Fetch active tasks (non-archived, non-deleted)
      const activeTasks = await tx.task.findMany({
        where: { deleted_at: null, weekly_report_id: null }
      });

      const completedTasks = activeTasks.filter((t) => t.status === 'COMPLETED');

      const total_tasks = activeTasks.length;
      const completed_tasks = completedTasks.length;
      const total_score = activeTasks.reduce((sum, t) => sum + t.score, 0);
      const completed_score = completedTasks.reduce((sum, t) => sum + t.score, 0);

      // 2. Generate week name
      const formattedDate = new Date().toLocaleDateString('pt-BR');
      const week_name = `Semana - ${formattedDate}`;

      // 3. Create the WeeklyReport record
      const createdReport = await tx.weeklyReport.create({
        data: {
          week_name,
          total_tasks,
          completed_tasks,
          total_score,
          completed_score,
        }
      });

      // 4. Archive COMPLETED tasks by associating them with the report
      if (completedTasks.length > 0) {
        await tx.task.updateMany({
          where: {
            id: { in: completedTasks.map((t) => t.id) }
          },
          data: {
            weekly_report_id: createdReport.id,
          }
        });
      }

      return createdReport;
    });

    return {
      id: report.id,
      week_name: report.week_name,
      closed_at: report.closed_at,
      total_tasks: report.total_tasks,
      completed_tasks: report.completed_tasks,
      total_score: report.total_score,
      completed_score: report.completed_score,
    };
  }
}
