import { ILogoutUseCase, LogoutUseCaseInput } from '../../contracts/usecase/auth/logout-usecase';
import { IAuthGateway } from '../../contracts/gateways/auth-gateway';

export class LogoutUseCase implements ILogoutUseCase {
  constructor(private readonly authGateway: IAuthGateway) {}

  async execute(data: LogoutUseCaseInput): Promise<void> {
    await this.authGateway.logout(data.refreshToken);
  }
}
