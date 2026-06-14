import { GetWeeklyReportController } from '../../../controllers/task/get-weekly-report-controller';
import { GetWeeklyReportUseCaseFactory } from '../../usecase/task/get-weekly-report-factory';

export class GetWeeklyReportControllerFactory {
  static create() {
    const useCase = GetWeeklyReportUseCaseFactory.create();
    const getWeeklyReportController = new GetWeeklyReportController(useCase);
    return getWeeklyReportController;
  }
}
