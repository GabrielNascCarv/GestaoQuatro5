import { CloseWeekUseCase } from '../../../usecase/task/close-week';
import { PrismaTaskRepository } from '../../../repositories/prisma-task-repository';

export class CloseWeekUseCaseFactory {
  static create() {
    const taskRepository = new PrismaTaskRepository();
    const closeWeekUseCase = new CloseWeekUseCase(taskRepository);
    return closeWeekUseCase;
  }
}
