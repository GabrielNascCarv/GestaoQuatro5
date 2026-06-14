import { ICreateUserUseCase, CreateUserInput, CreateUserOutput } from '../../contracts/usecase/user/create-user-usecase';
import { IUserRepository } from '../../contracts/repository/user-repository';
import { IAuthGateway } from '../../contracts/gateways/auth-gateway';
import { User } from '../../entities/user';

export class CreateUserUseCase implements ICreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly authGateway: IAuthGateway
  ) {}

  async execute(data: CreateUserInput): Promise<CreateUserOutput> {
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
