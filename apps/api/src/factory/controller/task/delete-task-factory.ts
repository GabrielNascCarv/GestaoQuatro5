import { DeleteTaskController } from '../../../controllers/task/delete-task-controller';
import { DeleteTaskUseCaseFactory } from '../../usecase/task/delete-task-factory';

export class DeleteTaskControllerFactory {
  static create() {
    const useCase = DeleteTaskUseCaseFactory.create();
    const deleteTaskController = new DeleteTaskController(useCase);
    return deleteTaskController;
  }
}
