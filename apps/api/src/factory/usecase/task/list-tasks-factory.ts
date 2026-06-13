import { ListTasksUseCase } from '../../../usecase/task/list-tasks';
import { PrismaTaskRepository } from '../../../repositories/prisma-task-repository';

export class ListTasksUseCaseFactory {
  static create() {
    const taskRepository = new PrismaTaskRepository();
    const listTasksUseCase = new ListTasksUseCase(taskRepository);
    return listTasksUseCase;
  }
}
