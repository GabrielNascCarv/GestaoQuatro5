import { Controller, HttpRequest, HttpResponse } from '../../adapters/fastify-route-adapter';
import { IListTasksUseCase } from '../../contracts/usecase/task/list-tasks-usecase';

export class ListTasksController implements Controller {
  constructor(private readonly listTasksUseCase: IListTasksUseCase) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const result = await this.listTasksUseCase.execute();
      return {
        statusCode: 200,
        body: result,
      };
    } catch (error: any) {
      return {
        statusCode: 400,
        body: {
          message: error.message || 'Erro ao listar tarefas.',
        },
      };
    }
  }
}
