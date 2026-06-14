import { ListUserTasksController } from '../../../controllers/task/list-user-tasks-controller';
import { ListUserTasksUseCaseFactory } from '../../usecase/task/list-user-tasks-factory';

export class ListUserTasksControllerFactory {
  static create() {
    const useCase = ListUserTasksUseCaseFactory.create();
    const listUserTasksController = new ListUserTasksController(useCase);
    return listUserTasksController;
  }
}
