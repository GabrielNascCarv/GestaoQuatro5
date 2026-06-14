import { IListTasksUseCase, ListTasksOutput } from '../../contracts/usecase/task/list-tasks-usecase';
import { ITaskRepository } from '../../contracts/repository/task-repository';

export class ListTasksUseCase implements IListTasksUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(): Promise<ListTasksOutput> {
    const list = await this.taskRepository.findAll();
    return list.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description ?? null,
      score: item.score,
      status: item.status,
      assigned_to_id: item.assigned_to_id ?? null,
      created_by_id: item.created_by_id,
      due_date: item.due_date ?? null,
      completed_at: item.completed_at ?? null,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));
  }
}
