import { UpdateTaskController } from '../../../controllers/task/update-task-controller';
import { UpdateTaskUseCaseFactory } from '../../usecase/task/update-task-factory';

export class UpdateTaskControllerFactory {
  static create() {
    const useCase = UpdateTaskUseCaseFactory.create();
    const updateTaskController = new UpdateTaskController(useCase);
    return updateTaskController;
  }
}
