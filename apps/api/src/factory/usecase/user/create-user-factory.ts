import { CreateUserUseCase } from '../../../usecase/user/create-user';
import { PrismaUserRepository } from '../../../repositories/prisma-user-repository';
import { KeycloakAuthGateway } from '../../../gateways/keycloak/keycloak-auth-gateway';

export class CreateUserUseCaseFactory {
  static create() {
    const userRepository = new PrismaUserRepository();
    const authGateway = new KeycloakAuthGateway();
    const useCase = new CreateUserUseCase(userRepository, authGateway);
    return useCase;
  }
}
