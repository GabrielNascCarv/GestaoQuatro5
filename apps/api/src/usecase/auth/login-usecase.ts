import { ILoginUseCase, LoginUseCaseInput, LoginUseCaseOutput } from '../../contracts/usecase/auth/login-usecase';
import { IAuthGateway } from '../../contracts/gateways/auth-gateway';

export class LoginUseCase implements ILoginUseCase {
  constructor(private readonly authGateway: IAuthGateway) {}

  async execute(data: LoginUseCaseInput): Promise<LoginUseCaseOutput> {
    const tokens = await this.authGateway.issueAccessToken(data);
    return tokens;
  }
}
