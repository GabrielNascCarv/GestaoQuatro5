import { ListUserTasksUseCase } from '../../../usecase/task/list-user-tasks';
import { PrismaTaskRepository } from '../../../repositories/prisma-task-repository';

export class ListUserTasksUseCaseFactory {
  static create() {
    const taskRepository = new PrismaTaskRepository();
    const listUserTasksUseCase = new ListUserTasksUseCase(taskRepository);
    return listUserTasksUseCase;
  }
}
