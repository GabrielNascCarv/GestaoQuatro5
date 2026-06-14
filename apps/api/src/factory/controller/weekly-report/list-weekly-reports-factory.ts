import { ListWeeklyReportsController } from '../../../controllers/weekly-report/list-weekly-reports-controller';
import { ListWeeklyReportsUseCaseFactory } from '../../usecase/weekly-report/list-weekly-reports-factory';

export class ListWeeklyReportsControllerFactory {
  static create() {
    const useCase = ListWeeklyReportsUseCaseFactory.create();
    const listWeeklyReportsController = new ListWeeklyReportsController(useCase);
    return listWeeklyReportsController;
  }
}
