import { FastifyInstance } from 'fastify';
import { adaptRoute } from '../../adapters/fastify-route-adapter';
import { CreateTaskControllerFactory } from '../../factory/controller/task/create-task-factory';
import { GetTaskControllerFactory } from '../../factory/controller/task/get-task-factory';
import { ListTasksControllerFactory } from '../../factory/controller/task/list-tasks-factory';

export async function taskRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/tasks',
    adaptRoute(CreateTaskControllerFactory.create())
  );

  fastify.get(
    '/tasks',
    adaptRoute(ListTasksControllerFactory.create())
  );

  fastify.get(
    '/tasks/:id',
    adaptRoute(GetTaskControllerFactory.create())
  );
}
