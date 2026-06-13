import { GetTaskController } from '../../../controllers/task/get-task-controller';
import { GetTaskUseCaseFactory } from '../../usecase/task/get-task-factory';

export class GetTaskControllerFactory {
  static create() {
    const useCase = GetTaskUseCaseFactory.create();
    const getTaskController = new GetTaskController(useCase);
    return getTaskController;
  }
}
