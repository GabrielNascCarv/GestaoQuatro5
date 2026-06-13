import { CreateTaskController } from '../../../controllers/task/create-task-controller';
import { CreateTaskUseCaseFactory } from '../../usecase/task/create-task-factory';

export class CreateTaskControllerFactory {
  static create() {
    const useCase = CreateTaskUseCaseFactory.create();
    const controller = new CreateTaskController(useCase);
    return controller;
  }
}
