export interface AuthCredentials {
  email: string;
  password: string;
}

export interface LoginUseCaseInput extends AuthCredentials {}

export interface LoginUseCaseOutput {
  accessToken: string;
  refreshToken: string;
}

export interface ILoginUseCase {
  execute(data: LoginUseCaseInput): Promise<LoginUseCaseOutput>;
}
