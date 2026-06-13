import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { Controller, HttpRequest, HttpResponse } from '../../adapters/fastify-route-adapter';
import { ICreateTaskUseCase } from '../../contracts/usecase/task/create-task-usecase';
import { CreateTaskDto } from './dto/create-task-dto';

export class CreateTaskController implements Controller {
  constructor(private readonly createTaskUseCase: ICreateTaskUseCase) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const dto = plainToInstance(CreateTaskDto, httpRequest.body);
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
      const result = await this.createTaskUseCase.execute(dto);

      return {
        statusCode: 201,
        body: result,
      };
    } catch (error: any) {
      return {
        statusCode: 400,
        body: {
          message: error.message || 'Erro ao criar tarefa.',
        },
      };
    }
  }
}
