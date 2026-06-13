import { IDeleteTaskUseCase, DeleteTaskInput } from '../../contracts/usecase/task/delete-task-usecase';
import { ITaskRepository } from '../../contracts/repository/task-repository';

export class DeleteTaskUseCase implements IDeleteTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(data: DeleteTaskInput): Promise<void> {
    const task = await this.taskRepository.findById(data.id);
    if (!task) {
      throw new Error('Tarefa não encontrada.');
    }

    await this.taskRepository.delete(data.id);
  }
}
