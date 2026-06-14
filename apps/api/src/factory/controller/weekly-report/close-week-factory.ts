import { CloseWeekController } from '../../../controllers/weekly-report/close-week-controller';
import { CloseWeekUseCaseFactory } from '../../usecase/weekly-report/close-week-factory';

export class CloseWeekControllerFactory {
  static create() {
    const useCase = CloseWeekUseCaseFactory.create();
    const closeWeekController = new CloseWeekController(useCase);
    return closeWeekController;
  }
}
