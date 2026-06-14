import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { Controller, HttpRequest, HttpResponse } from '../../adapters/fastify-route-adapter';
import { ILoginUseCase } from '../../contracts/usecase/auth/login-usecase';
import { LoginDto } from './dto/login-dto';

export class LoginController implements Controller {
  constructor(private readonly loginUseCase: ILoginUseCase) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const dto = plainToInstance(LoginDto, httpRequest.body);
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
      const result = await this.loginUseCase.execute(dto);

      return {
        statusCode: 200,
        body: result,
      };
    } catch (error: any) {
      return {
        statusCode: 401,
        body: {
          message: error.message || 'Falha na autenticação.',
        },
      };
    }
  }
}
