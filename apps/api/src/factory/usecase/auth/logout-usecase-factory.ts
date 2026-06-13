import { LogoutUseCase } from '../../../usecase/auth/logout-usecase';
import { KeycloakAuthGateway } from '../../../gateways/keycloak/keycloak-auth-gateway';

export class LogoutUseCaseFactory {
  static create() {
    const authGateway = new KeycloakAuthGateway();
    const useCase = new LogoutUseCase(authGateway);
    return useCase;
  }
}
