import { GetWeeklyReportController } from '../../../controllers/weekly-report/get-weekly-report-controller';
import { GetWeeklyReportUseCaseFactory } from '../../usecase/weekly-report/get-weekly-report-factory';

export class GetWeeklyReportControllerFactory {
  static create() {
    const useCase = GetWeeklyReportUseCaseFactory.create();
    const getWeeklyReportController = new GetWeeklyReportController(useCase);
    return getWeeklyReportController;
  }
}
