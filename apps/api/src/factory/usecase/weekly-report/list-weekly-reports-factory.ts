import { ListWeeklyReportsUseCase } from '../../../usecase/weekly-report/list-weekly-reports';
import { PrismaWeeklyReportRepository } from '../../../repositories/prisma-weekly-report-repository';

export class ListWeeklyReportsUseCaseFactory {
  static create() {
    const weeklyReportRepository = new PrismaWeeklyReportRepository();
    const listWeeklyReportsUseCase = new ListWeeklyReportsUseCase(weeklyReportRepository);
    return listWeeklyReportsUseCase;
  }
}
