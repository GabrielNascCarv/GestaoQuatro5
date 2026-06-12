import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { Controller, HttpRequest, HttpResponse } from '../../adapters/fastify-route-adapter';
import { ICreateUserUseCase } from '../../contracts/usecase/user/create-user-usecase';
import { CreateUserDto } from './dto/create-user-dto';

export class CreateUserController implements Controller {
  constructor(private readonly createUserUseCase: ICreateUserUseCase) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const dto = plainToInstance(CreateUserDto, httpRequest.body);
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
      const result = await this.createUserUseCase.execute(dto);

      return {
        statusCode: 201,
        body: result,
      };
    } catch (error: any) {
      return {
        statusCode: 400,
        body: {
          message: error.message || 'Erro ao criar usuário.',
        },
      };
    }
  }
}
