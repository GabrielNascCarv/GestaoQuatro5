import { DeleteTaskUseCase } from '../../../usecase/task/delete-task';
import { PrismaTaskRepository } from '../../../repositories/prisma-task-repository';

export class DeleteTaskUseCaseFactory {
  static create() {
    const taskRepository = new PrismaTaskRepository();
    const deleteTaskUseCase = new DeleteTaskUseCase(taskRepository);
    return deleteTaskUseCase;
  }
}
