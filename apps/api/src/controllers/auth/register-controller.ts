import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { Controller, HttpRequest, HttpResponse } from '../../adapters/fastify-route-adapter';
import { IRegisterUseCase } from '../../contracts/usecase/auth/register-usecase';
import { RegisterDto } from './dto/register-dto';

export class RegisterController implements Controller {
  constructor(private readonly registerUseCase: IRegisterUseCase) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const dto = plainToInstance(RegisterDto, httpRequest.body);
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
      const result = await this.registerUseCase.execute(dto);

      return {
        statusCode: 201,
        body: result,
      };
    } catch (error: any) {
      return {
        statusCode: 400,
        body: {
          message: error.message || 'Erro ao registrar usuário.',
        },
      };
    }
  }
}
