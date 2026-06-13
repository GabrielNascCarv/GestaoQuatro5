import { LoginUseCase } from '../../../usecase/auth/login-usecase';
import { KeycloakAuthGateway } from '../../../gateways/keycloak/keycloak-auth-gateway';

export class LoginUseCaseFactory {
  static create() {
    const authGateway = new KeycloakAuthGateway();
    const useCase = new LoginUseCase(authGateway);
    return useCase;
  }
}
