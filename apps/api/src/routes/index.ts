import { FastifyInstance } from 'fastify';
import { userRoutes } from './user/user-routes';
import { authRoutes } from './auth/auth-routes';
import { taskRoutes } from './task/task-routes';
import { weeklyReportRoutes } from './weekly-report/weekly-report-routes';

export async function router(fastify: FastifyInstance) {
  fastify.register(userRoutes);
  fastify.register(authRoutes);
  fastify.register(taskRoutes);
  fastify.register(weeklyReportRoutes);
}

