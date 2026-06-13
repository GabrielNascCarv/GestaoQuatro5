import { Controller, HttpRequest, HttpResponse } from '../../adapters/fastify-route-adapter';
import { IGetTaskUseCase } from '../../contracts/usecase/task/get-task-usecase';

export class GetTaskController implements Controller {
  constructor(private readonly getTaskUseCase: IGetTaskUseCase) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const { id } = httpRequest.params as any;
    if (!id) {
      return {
        statusCode: 400,
        body: { message: 'ID da tarefa é obrigatório.' },
      };
    }

    try {
      const result = await this.getTaskUseCase.execute({ id });
      return {
        statusCode: 200,
        body: result,
      };
    } catch (error: any) {
      return {
        statusCode: 404,
        body: {
          message: error.message || 'Tarefa não encontrada.',
        },
      };
    }
  }
}
