import { GetTaskMetricsUseCase } from '../../../usecase/task/get-task-metrics';
import { PrismaWeeklyReportRepository } from '../../../repositories/prisma-weekly-report-repository';

export class GetTaskMetricsUseCaseFactory {
  static create() {
    const weeklyReportRepository = new PrismaWeeklyReportRepository();
    const getTaskMetricsUseCase = new GetTaskMetricsUseCase(weeklyReportRepository);
    return getTaskMetricsUseCase;
  }
}
