import { FastifyInstance } from 'fastify';
import { userRoutes } from './user/user-routes';
import { authRoutes } from './auth/auth-routes';
import { taskRoutes } from './task/task-routes';

export async function router(fastify: FastifyInstance) {
  fastify.register(userRoutes);
  fastify.register(authRoutes);
  fastify.register(taskRoutes);
}

