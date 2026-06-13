export interface RegisterUseCaseInput {
  name: string;
  email: string;
  password: string;
}

export interface RegisterUseCaseOutput {
  id: string;
  name: string;
  email: string;
  created_at: Date;
}

export interface IRegisterUseCase {
  execute(data: RegisterUseCaseInput): Promise<RegisterUseCaseOutput>;
}
