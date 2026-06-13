import { ListTasksController } from '../../../controllers/task/list-tasks-controller';
import { ListTasksUseCaseFactory } from '../../usecase/task/list-tasks-factory';

export class ListTasksControllerFactory {
  static create() {
    const useCase = ListTasksUseCaseFactory.create();
    const listTasksController = new ListTasksController(useCase);
    return listTasksController;
  }
}
