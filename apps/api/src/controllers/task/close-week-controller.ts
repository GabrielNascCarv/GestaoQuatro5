import { Controller, HttpRequest, HttpResponse } from '../../adapters/fastify-route-adapter';
import { ICloseWeekUseCase } from '../../contracts/usecase/task/close-week-usecase';

export class CloseWeekController implements Controller {
  constructor(private readonly closeWeekUseCase: ICloseWeekUseCase) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const result = await this.closeWeekUseCase.execute();
      return {
        statusCode: 201,
        body: result,
      };
    } catch (error: any) {
      return {
        statusCode: 400,
        body: {
          message: error.message || 'Erro ao realizar o fechamento da semana.',
        },
      };
    }
  }
}
