import { GetTaskMetricsUseCase } from '../../../usecase/task/get-task-metrics';
import { PrismaTaskRepository } from '../../../repositories/prisma-task-repository';

export class GetTaskMetricsUseCaseFactory {
  static create() {
    const taskRepository = new PrismaTaskRepository();
    const getTaskMetricsUseCase = new GetTaskMetricsUseCase(taskRepository);
    return getTaskMetricsUseCase;
  }
}
