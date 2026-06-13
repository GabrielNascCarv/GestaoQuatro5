export interface DeleteTaskInput {
  id: string;
}

export interface IDeleteTaskUseCase {
  execute(data: DeleteTaskInput): Promise<void>;
}
