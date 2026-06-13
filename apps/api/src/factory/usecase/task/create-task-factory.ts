import { CreateTaskUseCase } from '../../../usecase/task/create-task';
import { PrismaTaskRepository } from '../../../repositories/prisma-task-repository';

export class CreateTaskUseCaseFactory {
  static create() {
    const taskRepository = new PrismaTaskRepository();
    const usecase = new CreateTaskUseCase(taskRepository);
    return usecase;
  }
}
