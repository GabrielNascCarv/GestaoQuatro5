import { IRegisterUseCase, RegisterUseCaseInput, RegisterUseCaseOutput } from '../../contracts/usecase/auth/register-usecase';
import { IUserRepository } from '../../contracts/repository/user-repository';
import { IAuthGateway } from '../../contracts/gateways/auth-gateway';
import { User } from '../../entities/user';

export class RegisterUseCase implements IRegisterUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly authGateway: IAuthGateway
  ) {}

  async execute(data: RegisterUseCaseInput): Promise<RegisterUseCaseOutput> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('E-mail já cadastrado.');
    }

    // 1. Create user in Keycloak first
    const { keycloakId } = await this.authGateway.createUser({
      name: data.name,
      email: data.email,
      password: data.password,
    });

    // 2. Create user in local database mapping keycloak_id
    const user = new User({
      name: data.name,
      email: data.email,
      password: data.password,
      keycloak_id: keycloakId,
    });

    const createdUser = await this.userRepository.create(user);

    return {
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      created_at: createdUser.created_at,
    };
  }
}
