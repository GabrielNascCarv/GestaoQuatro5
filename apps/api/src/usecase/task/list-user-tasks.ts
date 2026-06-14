import { IListUserTasksUseCase, ListUserTasksOutput } from '../../contracts/usecase/task/list-user-tasks-usecase';
import { ITaskRepository } from '../../contracts/repository/task-repository';

export class ListUserTasksUseCase implements IListUserTasksUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(userId: string): Promise<ListUserTasksOutput> {
    const list = await this.taskRepository.findByAssigneeId(userId);
    return list.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description ?? null,
      score: item.score,
      status: item.status,
      assigned_to_id: item.assigned_to_id ?? null,
      created_by_id: item.created_by_id,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));
  }
}
