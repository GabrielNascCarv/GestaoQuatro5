import { FastifyInstance } from 'fastify';
import { userRoutes } from './user/user-routes';

export async function router(fastify: FastifyInstance) {
  fastify.register(userRoutes);
}
