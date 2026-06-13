import { GetTaskUseCase } from '../../../usecase/task/get-task';
import { PrismaTaskRepository } from '../../../repositories/prisma-task-repository';

export class GetTaskUseCaseFactory {
  static create() {
    const taskRepository = new PrismaTaskRepository();
    const getTaskUseCase = new GetTaskUseCase(taskRepository);
    return getTaskUseCase;
  }
}
