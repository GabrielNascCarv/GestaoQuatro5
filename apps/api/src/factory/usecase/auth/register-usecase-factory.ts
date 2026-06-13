import { RegisterUseCase } from '../../../usecase/auth/register-usecase';
import { PrismaUserRepository } from '../../../repositories/prisma-user-repository';
import { KeycloakAuthGateway } from '../../../gateways/keycloak/keycloak-auth-gateway';

export class RegisterUseCaseFactory {
  static create() {
    const userRepository = new PrismaUserRepository();
    const authGateway = new KeycloakAuthGateway();
    const useCase = new RegisterUseCase(userRepository, authGateway);
    return useCase;
  }
}
