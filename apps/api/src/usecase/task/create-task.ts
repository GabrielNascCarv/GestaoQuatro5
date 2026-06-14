import { ICreateTaskUseCase, CreateTaskInput, CreateTaskOutput } from '../../contracts/usecase/task/create-task-usecase';
import { ITaskRepository } from '../../contracts/repository/task-repository';
import { Task } from '../../entities/task';

export class CreateTaskUseCase implements ICreateTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(data: CreateTaskInput): Promise<CreateTaskOutput> {
    const task = new Task({
      title: data.title,
      description: data.description || null,
      score: data.score,
      created_by_id: data.created_by_id,
      due_date: data.due_date ? new Date(data.due_date) : null,
    });

    const created = await this.taskRepository.create(task);

    return {
      id: created.id,
      title: created.title,
      description: created.description ?? null,
      score: created.score,
      status: created.status,
      assigned_to_id: created.assigned_to_id ?? null,
      created_by_id: created.created_by_id,
      due_date: created.due_date ?? null,
      completed_at: created.completed_at ?? null,
      created_at: created.created_at,
      updated_at: created.updated_at,
    };
  }
}
