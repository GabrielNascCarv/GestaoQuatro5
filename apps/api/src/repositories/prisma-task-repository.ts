import { prisma } from '@gestao-quatro5/database';
import { ITaskRepository } from '../contracts/repository/task-repository';
import { Task, TaskStatus } from '../entities/task';

export class PrismaTaskRepository implements ITaskRepository {
  async create(task: Task): Promise<Task> {
    const created = await prisma.task.create({
      data: {
        title: task.title,
        description: task.description,
        score: task.score,
        status: task.status,
        assigned_to_id: task.assigned_to_id,
        created_by_id: task.created_by_id,
      },
    });

    const taskNew = new Task({
      id: created.id,
      title: created.title,
      description: created.description,
      score: created.score,
      status: created.status as TaskStatus,
      assigned_to_id: created.assigned_to_id,
      created_by_id: created.created_by_id,
      created_at: created.created_at,
      updated_at: created.updated_at,
      deleted_at: created.deleted_at,
    });

    return taskNew;
  }

  async findById(id: string): Promise<Task | null> {
    const found = await prisma.task.findFirst({
      where: { id, deleted_at: null },
    });

    if (!found) return null;

    const taskFound = new Task({
      id: found.id,
      title: found.title,
      description: found.description,
      score: found.score,
      status: found.status as TaskStatus,
      assigned_to_id: found.assigned_to_id,
      created_by_id: found.created_by_id,
      created_at: found.created_at,
      updated_at: found.updated_at,
      deleted_at: found.deleted_at,
    });

    return taskFound;
  }

  async findAll(): Promise<Task[]> {
    const list = await prisma.task.findMany({
      where: { deleted_at: null },
      orderBy: { created_at: 'desc' },
    });

    const listTasks = list.map(
      (item) =>
        new Task({
          id: item.id,
          title: item.title,
          description: item.description,
          score: item.score,
          status: item.status as TaskStatus,
          assigned_to_id: item.assigned_to_id,
          created_by_id: item.created_by_id,
          created_at: item.created_at,
          updated_at: item.updated_at,
          deleted_at: item.deleted_at,
        })
    );

    return listTasks;
  }

  async update(id: string, task: Partial<Task>): Promise<Task> {
    const updated = await prisma.task.update({
      where: { id },
      data: {
        title: task.title,
        description: task.description,
        score: task.score,
        status: task.status,
        assigned_to_id: task.assigned_to_id,
      },
    });

    const taskUpdated = new Task({
      id: updated.id,
      title: updated.title,
      description: updated.description,
      score: updated.score,
      status: updated.status as TaskStatus,
      assigned_to_id: updated.assigned_to_id,
      created_by_id: updated.created_by_id,
      created_at: updated.created_at,
      updated_at: updated.updated_at,
      deleted_at: updated.deleted_at,
    });

    return taskUpdated;
  }

  async delete(id: string): Promise<void> {
    await prisma.task.update({
      where: { id },
      data: {
        deleted_at: new Date(),
      },
    });
  }
}
