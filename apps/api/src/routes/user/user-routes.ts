import { FastifyInstance } from 'fastify';
import { adaptRoute } from '../../adapters/fastify-route-adapter';
import { CreateUserControllerFactory } from '../../factory/controller/user/create-user-factory';

export async function userRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/users',
    adaptRoute(CreateUserControllerFactory.create())
  );
}
