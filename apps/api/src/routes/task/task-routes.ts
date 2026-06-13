import { FastifyInstance } from 'fastify';
import { adaptRoute } from '../../adapters/fastify-route-adapter';
import { CreateTaskControllerFactory } from '../../factory/controller/task/create-task-factory';

export async function taskRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/tasks',
    adaptRoute(CreateTaskControllerFactory.create())
  );
}
