export interface AuthUser {
  name: string;
  email: string;
  password?: string;
}

export interface IAuthGateway {
  createUser(user: AuthUser): Promise<{ keycloakId: string }>;
}
