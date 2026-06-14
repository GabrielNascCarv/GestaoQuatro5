import { GetWeeklyReportUseCase } from '../../../usecase/weekly-report/get-weekly-report';
import { PrismaWeeklyReportRepository } from '../../../repositories/prisma-weekly-report-repository';

export class GetWeeklyReportUseCaseFactory {
  static create() {
    const weeklyReportRepository = new PrismaWeeklyReportRepository();
    const getWeeklyReportUseCase = new GetWeeklyReportUseCase(weeklyReportRepository);
    return getWeeklyReportUseCase;
  }
}
