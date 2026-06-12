import { CreateUserController } from '../../../controllers/user/create-user-controller';
import { CreateUserUseCaseFactory } from '../../usecase/user/create-user-factory';

export class CreateUserControllerFactory {
  static create() {
    const useCase = CreateUserUseCaseFactory.create();
    const controller = new CreateUserController(useCase);
    return controller;
  }
}
