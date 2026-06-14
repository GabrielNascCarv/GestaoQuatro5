import { FastifyInstance } from 'fastify';
import { adaptRoute } from '../../adapters/fastify-route-adapter';
import { CloseWeekControllerFactory } from '../../factory/controller/weekly-report/close-week-factory';
import { ListWeeklyReportsControllerFactory } from '../../factory/controller/weekly-report/list-weekly-reports-factory';
import { GetWeeklyReportControllerFactory } from '../../factory/controller/weekly-report/get-weekly-report-factory';

export async function weeklyReportRoutes(fastify: FastifyInstance) {
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
}
