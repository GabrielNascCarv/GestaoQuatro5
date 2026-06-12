export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
}

export interface CreateUserOutput {
  id: string;
  name: string;
  email: string;
  created_at: Date;
}

export interface ICreateUserUseCase {
  execute(data: CreateUserInput): Promise<CreateUserOutput>;
}
