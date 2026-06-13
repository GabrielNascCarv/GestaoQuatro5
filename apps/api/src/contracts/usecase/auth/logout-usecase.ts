export interface LogoutUseCaseInput {
  refreshToken: string;
}

export interface ILogoutUseCase {
  execute(data: LogoutUseCaseInput): Promise<void>;
}
