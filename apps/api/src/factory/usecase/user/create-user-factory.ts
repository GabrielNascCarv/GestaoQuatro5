import { CreateUserUseCase } from '../../../usecase/user/create-user';
import { PrismaUserRepository } from '../../../repositories/prisma-user-repository';

export class CreateUserUseCaseFactory {
  static create() {
    const userRepository = new PrismaUserRepository();
    const useCase = new CreateUserUseCase(userRepository);
    return useCase;
  }
}
