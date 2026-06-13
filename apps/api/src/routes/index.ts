import { FastifyInstance } from 'fastify';
import { userRoutes } from './user/user-routes';
import { authRoutes } from './auth/auth-routes';

export async function router(fastify: FastifyInstance) {
  fastify.register(userRoutes);
  fastify.register(authRoutes);
}

