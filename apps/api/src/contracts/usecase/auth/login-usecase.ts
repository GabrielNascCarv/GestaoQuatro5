export interface LoginUseCaseInput {
  email: string;
  password: string;
}

export interface LoginUseCaseOutput {
  accessToken: string;
  refreshToken: string;
}

export interface ILoginUseCase {
  execute(data: LoginUseCaseInput): Promise<LoginUseCaseOutput>;
}
