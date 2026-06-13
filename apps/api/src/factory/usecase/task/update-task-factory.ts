import { UpdateTaskUseCase } from '../../../usecase/task/update-task';
import { PrismaTaskRepository } from '../../../repositories/prisma-task-repository';

export class UpdateTaskUseCaseFactory {
  static create() {
    const taskRepository = new PrismaTaskRepository();
    const updateTaskUseCase = new UpdateTaskUseCase(taskRepository);
    return updateTaskUseCase;
  }
}
