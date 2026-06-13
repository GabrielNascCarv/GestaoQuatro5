import { LogoutController } from '../../../controllers/auth/logout-controller';
import { LogoutUseCaseFactory } from '../../usecase/auth/logout-usecase-factory';

export class LogoutControllerFactory {
  static create() {
    const useCase = LogoutUseCaseFactory.create();
    const controller = new LogoutController(useCase);
    return controller;
  }
}
