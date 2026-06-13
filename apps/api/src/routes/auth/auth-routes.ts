import { FastifyInstance } from 'fastify';
import { adaptRoute } from '../../adapters/fastify-route-adapter';
import { LoginControllerFactory } from '../../factory/controller/auth/login-controller-factory';
import { LogoutControllerFactory } from '../../factory/controller/auth/logout-controller-factory';
import { RegisterControllerFactory } from '../../factory/controller/auth/register-controller-factory';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/auth/login',
    adaptRoute(LoginControllerFactory.create())
  );

  fastify.post(
    '/auth/logout',
    adaptRoute(LogoutControllerFactory.create())
  );

  fastify.post(
    '/auth/register',
    adaptRoute(RegisterControllerFactory.create())
  );
}
