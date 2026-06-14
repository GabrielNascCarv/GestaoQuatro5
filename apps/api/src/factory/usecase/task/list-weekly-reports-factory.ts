import { ListWeeklyReportsUseCase } from '../../../usecase/task/list-weekly-reports';
import { PrismaTaskRepository } from '../../../repositories/prisma-task-repository';

export class ListWeeklyReportsUseCaseFactory {
  static create() {
    const taskRepository = new PrismaTaskRepository();
    const listWeeklyReportsUseCase = new ListWeeklyReportsUseCase(taskRepository);
    return listWeeklyReportsUseCase;
  }
}
