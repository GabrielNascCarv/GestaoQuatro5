import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { Controller, HttpRequest, HttpResponse } from '../../adapters/fastify-route-adapter';
import { ILogoutUseCase } from '../../contracts/usecase/auth/logout-usecase';
import { LogoutDto } from './dto/logout-dto';

export class LogoutController implements Controller {
  constructor(private readonly logoutUseCase: ILogoutUseCase) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const dto = plainToInstance(LogoutDto, httpRequest.body);
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
      await this.logoutUseCase.execute(dto);

      return {
        statusCode: 204,
        body: null,
      };
    } catch (error: any) {
      return {
        statusCode: 400,
        body: {
          message: error.message || 'Falha ao realizar logout.',
        },
      };
    }
  }
}
