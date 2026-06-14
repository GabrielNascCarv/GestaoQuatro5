import { IUpdateTaskUseCase, UpdateTaskInput, UpdateTaskOutput } from '../../contracts/usecase/task/update-task-usecase';
import { ITaskRepository } from '../../contracts/repository/task-repository';

export class UpdateTaskUseCase implements IUpdateTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(data: UpdateTaskInput): Promise<UpdateTaskOutput> {
    const task = await this.taskRepository.findById(data.id);
    if (!task) {
      throw new Error('Tarefa não encontrada.');
    }

    let completedAt: Date | null | undefined = undefined;
    if (data.status !== undefined) {
      completedAt = data.status === 'COMPLETED' ? new Date() : null;
    }

    const updated = await this.taskRepository.update(data.id, {
      title: data.title,
      description: data.description,
      score: data.score,
      status: data.status,
      assigned_to_id: data.assigned_to_id,
      due_date: data.due_date !== undefined ? (data.due_date ? new Date(data.due_date) : null) : undefined,
      completed_at: completedAt,
    });

    return {
      id: updated.id,
      title: updated.title,
      description: updated.description ?? null,
      score: updated.score,
      status: updated.status,
      assigned_to_id: updated.assigned_to_id ?? null,
      created_by_id: updated.created_by_id,
      due_date: updated.due_date ?? null,
      completed_at: updated.completed_at ?? null,
      created_at: updated.created_at,
      updated_at: updated.updated_at,
    };
  }
}
