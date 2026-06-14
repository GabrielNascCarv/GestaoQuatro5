import { Controller, HttpRequest, HttpResponse } from '../../adapters/fastify-route-adapter';
import { IListWeeklyReportsUseCase } from '../../contracts/usecase/task/list-weekly-reports-usecase';

export class ListWeeklyReportsController implements Controller {
  constructor(private readonly listWeeklyReportsUseCase: IListWeeklyReportsUseCase) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const result = await this.listWeeklyReportsUseCase.execute();
      return {
        statusCode: 200,
        body: result,
      };
    } catch (error: any) {
      return {
        statusCode: 400,
        body: {
          message: error.message || 'Erro ao listar relatórios semanais.',
        },
      };
    }
  }
}
