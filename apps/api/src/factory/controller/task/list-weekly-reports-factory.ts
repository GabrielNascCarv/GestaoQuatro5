import { ListWeeklyReportsController } from '../../../controllers/task/list-weekly-reports-controller';
import { ListWeeklyReportsUseCaseFactory } from '../../usecase/task/list-weekly-reports-factory';

export class ListWeeklyReportsControllerFactory {
  static create() {
    const useCase = ListWeeklyReportsUseCaseFactory.create();
    const listWeeklyReportsController = new ListWeeklyReportsController(useCase);
    return listWeeklyReportsController;
  }
}
