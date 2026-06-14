import { Controller, HttpRequest, HttpResponse } from '../../adapters/fastify-route-adapter';
import { IGetTaskMetricsUseCase } from '../../contracts/usecase/task/get-task-metrics-usecase';

export class GetTaskMetricsController implements Controller {
  constructor(private readonly getTaskMetricsUseCase: IGetTaskMetricsUseCase) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const result = await this.getTaskMetricsUseCase.execute();
      return {
        statusCode: 200,
        body: result,
      };
    } catch (error: any) {
      return {
        statusCode: 400,
        body: {
          message: error.message || 'Erro ao obter métricas do dashboard.',
        },
      };
    }
  }
}
