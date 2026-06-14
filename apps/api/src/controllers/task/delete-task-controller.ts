import { Controller, HttpRequest, HttpResponse } from '../../adapters/fastify-route-adapter';
import { IDeleteTaskUseCase } from '../../contracts/usecase/task/delete-task-usecase';

export class DeleteTaskController implements Controller {
  constructor(private readonly deleteTaskUseCase: IDeleteTaskUseCase) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const { id } = httpRequest.params as any;
    if (!id) {
      return {
        statusCode: 400,
        body: { message: 'ID da tarefa é obrigatório.' },
      };
    }

    try {
      await this.deleteTaskUseCase.execute({ id });
      return {
        statusCode: 204,
        body: null,
      };
    } catch (error: any) {
      return {
        statusCode: 400,
        body: {
          message: error.message || 'Erro ao deletar tarefa.',
        },
      };
    }
  }
}
