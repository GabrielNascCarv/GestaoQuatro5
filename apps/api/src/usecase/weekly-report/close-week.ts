import { ICloseWeekUseCase, CloseWeekOutput } from '../../contracts/usecase/weekly-report/close-week-usecase';
import { ITaskRepository } from '../../contracts/repository/task-repository';
import { IWeeklyReportRepository } from '../../contracts/repository/weekly-report-repository';
import { WeeklyReport } from '../../entities/weekly-report';

export class CloseWeekUseCase implements ICloseWeekUseCase {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly weeklyReportRepository: IWeeklyReportRepository
  ) {}

  async execute(): Promise<CloseWeekOutput> {
    // 1. Fetch active tasks (non-archived, non-deleted)
    const activeTasks = await this.taskRepository.findActive();

    const completedTasks = activeTasks.filter((t) => t.status === 'COMPLETED');

    const total_tasks = activeTasks.length;
    const completed_tasks = completedTasks.length;
    const total_score = activeTasks.reduce((sum, t) => sum + t.score, 0);
    const completed_score = completedTasks.reduce((sum, t) => sum + t.score, 0);

    // 2. Generate week name
    const formattedDate = new Date().toLocaleDateString('pt-BR');
    const week_name = `Semana - ${formattedDate}`;

    // 3. Create the WeeklyReport record using weeklyReportRepository
    const report = new WeeklyReport({
      week_name,
      total_tasks,
      completed_tasks,
      total_score,
      completed_score,
    });

    const taskIds = completedTasks.map((t) => t.id);
    const createdReport = await this.weeklyReportRepository.create(report, taskIds);

    return {
      id: createdReport.id,
      week_name: createdReport.week_name,
      closed_at: createdReport.closed_at,
      total_tasks: createdReport.total_tasks,
      completed_tasks: createdReport.completed_tasks,
      total_score: createdReport.total_score,
      completed_score: createdReport.completed_score,
    };
  }
}
