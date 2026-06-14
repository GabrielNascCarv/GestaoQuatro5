import { GetWeeklyReportUseCase } from '../../../usecase/task/get-weekly-report';
import { PrismaTaskRepository } from '../../../repositories/prisma-task-repository';

export class GetWeeklyReportUseCaseFactory {
  static create() {
    const taskRepository = new PrismaTaskRepository();
    const getWeeklyReportUseCase = new GetWeeklyReportUseCase(taskRepository);
    return getWeeklyReportUseCase;
  }
}
