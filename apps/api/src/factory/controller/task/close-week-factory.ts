import { CloseWeekController } from '../../../controllers/task/close-week-controller';
import { CloseWeekUseCaseFactory } from '../../usecase/task/close-week-factory';

export class CloseWeekControllerFactory {
  static create() {
    const useCase = CloseWeekUseCaseFactory.create();
    const closeWeekController = new CloseWeekController(useCase);
    return closeWeekController;
  }
}
