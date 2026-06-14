import { prisma } from '@gestao-quatro5/database';
import { IWeeklyReportRepository } from '../contracts/repository/weekly-report-repository';
import { WeeklyReport } from '../entities/weekly-report';
import { Task, TaskStatus } from '../entities/task';

export class PrismaWeeklyReportRepository implements IWeeklyReportRepository {
  async create(report: WeeklyReport, taskIds: string[]): Promise<WeeklyReport> {
    const created = await prisma.$transaction(async (tx) => {
      // 1. Create the WeeklyReport record
      const dbReport = await tx.weeklyReport.create({
        data: {
          week_name: report.week_name,
          total_tasks: report.total_tasks,
          completed_tasks: report.completed_tasks,
          total_score: report.total_score,
          completed_score: report.completed_score,
        },
      });

      // 2. Associate tasks with the report
      if (taskIds.length > 0) {
        await tx.task.updateMany({
          where: {
            id: { in: taskIds },
          },
          data: {
            weekly_report_id: dbReport.id,
          },
        });
      }

      return dbReport;
    });

    return new WeeklyReport({
      id: created.id,
      week_name: created.week_name,
      closed_at: created.closed_at,
      total_tasks: created.total_tasks,
      completed_tasks: created.completed_tasks,
      total_score: created.total_score,
      completed_score: created.completed_score,
      created_at: created.created_at,
      updated_at: created.updated_at,
      deleted_at: created.deleted_at,
    });
  }

  async findAll(): Promise<WeeklyReport[]> {
    const list = await prisma.weeklyReport.findMany({
      orderBy: { closed_at: 'desc' },
    });

    return list.map((report) => new WeeklyReport({
      id: report.id,
      week_name: report.week_name,
      closed_at: report.closed_at,
      total_tasks: report.total_tasks,
      completed_tasks: report.completed_tasks,
      total_score: report.total_score,
      completed_score: report.completed_score,
      created_at: report.created_at,
      updated_at: report.updated_at,
      deleted_at: report.deleted_at,
    }));
  }

  async findById(id: string): Promise<WeeklyReport | null> {
    const found = await prisma.weeklyReport.findUnique({
      where: { id },
      include: {
        tasks: {
          include: {
            assigned_to: true,
          },
        },
      },
    });

    if (!found) return null;

    const report = new WeeklyReport({
      id: found.id,
      week_name: found.week_name,
      closed_at: found.closed_at,
      total_tasks: found.total_tasks,
      completed_tasks: found.completed_tasks,
      total_score: found.total_score,
      completed_score: found.completed_score,
      created_at: found.created_at,
      updated_at: found.updated_at,
      deleted_at: found.deleted_at,
    });

    if (found.tasks) {
      report.tasks = found.tasks.map((task) => new Task({
        id: task.id,
        title: task.title,
        description: task.description,
        score: task.score,
        status: task.status as TaskStatus,
        assigned_to_id: task.assigned_to_id,
        created_by_id: task.created_by_id,
        due_date: task.due_date,
        completed_at: task.completed_at,
        weekly_report_id: task.weekly_report_id,
        assigned_to: task.assigned_to ? {
          id: task.assigned_to.id,
          name: task.assigned_to.name,
          email: task.assigned_to.email,
        } : null,
        created_at: task.created_at,
        updated_at: task.updated_at,
        deleted_at: task.deleted_at,
      }));
    }

    return report;
  }
}
