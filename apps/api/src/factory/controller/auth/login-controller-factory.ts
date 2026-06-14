import { LoginController } from '../../../controllers/auth/login-controller';
import { LoginUseCaseFactory } from '../../usecase/auth/login-usecase-factory';

export class LoginControllerFactory {
  static create() {
    const useCase = LoginUseCaseFactory.create();
    const controller = new LoginController(useCase);
    return controller;
  }
}
