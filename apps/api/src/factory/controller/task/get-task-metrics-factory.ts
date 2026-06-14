import { GetTaskMetricsController } from '../../../controllers/task/get-task-metrics-controller';
import { GetTaskMetricsUseCaseFactory } from '../../usecase/task/get-task-metrics-factory';

export class GetTaskMetricsControllerFactory {
  static create() {
    const useCase = GetTaskMetricsUseCaseFactory.create();
    const getTaskMetricsController = new GetTaskMetricsController(useCase);
    return getTaskMetricsController;
  }
}
