import { Controller, HttpRequest, HttpResponse } from '../../adapters/fastify-route-adapter';
import { IListUserTasksUseCase } from '../../contracts/usecase/task/list-user-tasks-usecase';

export class ListUserTasksController implements Controller {
  constructor(private readonly listUserTasksUseCase: IListUserTasksUseCase) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { userId } = httpRequest.params;
      if (!userId) {
        throw new Error('O ID do usuário é obrigatório.');
      }

      const result = await this.listUserTasksUseCase.execute(userId);
      return {
        statusCode: 200,
        body: result,
      };
    } catch (error: any) {
      return {
        statusCode: 400,
        body: {
          message: error.message || 'Erro ao listar tarefas do usuário.',
        },
      };
    }
  }
}
