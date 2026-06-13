import { IGetTaskUseCase, GetTaskInput, GetTaskOutput } from '../../contracts/usecase/task/get-task-usecase';
import { ITaskRepository } from '../../contracts/repository/task-repository';

export class GetTaskUseCase implements IGetTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(data: GetTaskInput): Promise<GetTaskOutput> {
    const task = await this.taskRepository.findById(data.id);
    if (!task) {
      throw new Error('Tarefa não encontrada.');
    }

    return {
      id: task.id,
      title: task.title,
      description: task.description ?? null,
      score: task.score,
      status: task.status,
      assigned_to_id: task.assigned_to_id ?? null,
      created_by_id: task.created_by_id,
      created_at: task.created_at,
      updated_at: task.updated_at,
    };
  }
}
