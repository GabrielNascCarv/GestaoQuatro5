import { RegisterController } from '../../../controllers/auth/register-controller';
import { RegisterUseCaseFactory } from '../../usecase/auth/register-usecase-factory';

export class RegisterControllerFactory {
  static create() {
    const useCase = RegisterUseCaseFactory.create();
    const controller = new RegisterController(useCase);
    return controller;
  }
}
