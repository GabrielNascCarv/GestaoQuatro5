import { Controller, HttpRequest, HttpResponse } from '../../adapters/fastify-route-adapter';
import { IGetWeeklyReportUseCase } from '../../contracts/usecase/weekly-report/get-weekly-report-usecase';

export class GetWeeklyReportController implements Controller {
  constructor(private readonly getWeeklyReportUseCase: IGetWeeklyReportUseCase) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { id } = httpRequest.params;
      const result = await this.getWeeklyReportUseCase.execute(id);
      return {
        statusCode: 200,
        body: result,
      };
    } catch (error: any) {
      return {
        statusCode: 400,
        body: {
          message: error.message || 'Erro ao obter relatório semanal.',
        },
      };
    }
  }
}
