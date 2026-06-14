import { CloseWeekUseCase } from '../../../usecase/weekly-report/close-week';
import { PrismaTaskRepository } from '../../../repositories/prisma-task-repository';
import { PrismaWeeklyReportRepository } from '../../../repositories/prisma-weekly-report-repository';

export class CloseWeekUseCaseFactory {
  static create() {
    const taskRepository = new PrismaTaskRepository();
    const weeklyReportRepository = new PrismaWeeklyReportRepository();
    const closeWeekUseCase = new CloseWeekUseCase(taskRepository, weeklyReportRepository);
    return closeWeekUseCase;
  }
}
