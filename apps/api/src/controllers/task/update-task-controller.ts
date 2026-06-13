import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { Controller, HttpRequest, HttpResponse } from '../../adapters/fastify-route-adapter';
import { IUpdateTaskUseCase } from '../../contracts/usecase/task/update-task-usecase';
import { UpdateTaskDto } from './dto/update-task-dto';

export class UpdateTaskController implements Controller {
  constructor(private readonly updateTaskUseCase: IUpdateTaskUseCase) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const { id } = httpRequest.params as any;
    if (!id) {
      return {
        statusCode: 400,
        body: { message: 'ID da tarefa é obrigatório.' },
      };
    }

    const dto = plainToInstance(UpdateTaskDto, httpRequest.body);
    const errors = await validate(dto);

    if (errors.length > 0) {
      return {
        statusCode: 400,
        body: {
          message: 'Falha na validação dos dados fornecidos.',
          errors: errors.map((err) => ({
            property: err.property,
            constraints: err.constraints,
          })),
        },
      };
    }

    try {
      const result = await this.updateTaskUseCase.execute({
        id,
        ...dto,
      });

      return {
        statusCode: 200,
        body: result,
      };
    } catch (error: any) {
      return {
        statusCode: 400,
        body: {
          message: error.message || 'Erro ao atualizar tarefa.',
        },
      };
    }
  }
}
