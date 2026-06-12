import { ICreateUserUseCase, CreateUserInput, CreateUserOutput } from '../../contracts/usecase/user/create-user-usecase';
import { IUserRepository } from '../../contracts/repository/user-repository';
import { User } from '../../entities/user';

export class CreateUserUseCase implements ICreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(data: CreateUserInput): Promise<CreateUserOutput> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('E-mail já cadastrado.');
    }

    const user = new User({
      name: data.name,
      email: data.email,
      password: data.password,
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
