import { FastifyInstance } from 'fastify';
import { adaptRoute } from '../../adapters/fastify-route-adapter';
import { CreateTaskControllerFactory } from '../../factory/controller/task/create-task-factory';
import { GetTaskControllerFactory } from '../../factory/controller/task/get-task-factory';
import { ListTasksControllerFactory } from '../../factory/controller/task/list-tasks-factory';
import { UpdateTaskControllerFactory } from '../../factory/controller/task/update-task-factory';
import { DeleteTaskControllerFactory } from '../../factory/controller/task/delete-task-factory';
import { ListUserTasksControllerFactory } from '../../factory/controller/task/list-user-tasks-factory';
import { GetTaskMetricsControllerFactory } from '../../factory/controller/task/get-task-metrics-factory';
import { CloseWeekControllerFactory } from '../../factory/controller/task/close-week-factory';
import { ListWeeklyReportsControllerFactory } from '../../factory/controller/task/list-weekly-reports-factory';
import { GetWeeklyReportControllerFactory } from '../../factory/controller/task/get-weekly-report-factory';

export async function taskRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/tasks',
    adaptRoute(CreateTaskControllerFactory.create())
  );

  fastify.post(
    '/tasks/close-week',
    adaptRoute(CloseWeekControllerFactory.create())
  );

  fastify.get(
    '/tasks/weekly-reports',
    adaptRoute(ListWeeklyReportsControllerFactory.create())
  );

  fastify.get(
    '/tasks/weekly-reports/:id',
    adaptRoute(GetWeeklyReportControllerFactory.create())
  );

  fastify.get(
    '/tasks',
    adaptRoute(ListTasksControllerFactory.create())
  );

  fastify.get(
    '/tasks/user/:userId',
    adaptRoute(ListUserTasksControllerFactory.create())
  );

  fastify.get(
    '/tasks/metrics',
    adaptRoute(GetTaskMetricsControllerFactory.create())
  );

  fastify.get(
    '/tasks/:id',
    adaptRoute(GetTaskControllerFactory.create())
  );

  fastify.patch(
    '/tasks/:id',
    adaptRoute(UpdateTaskControllerFactory.create())
  );

  fastify.delete(
    '/tasks/:id',
    adaptRoute(DeleteTaskControllerFactory.create())
  );
}
