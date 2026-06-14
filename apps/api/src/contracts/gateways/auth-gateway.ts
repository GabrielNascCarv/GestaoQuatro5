export interface AuthUser {
  name: string;
  email: string;
  password?: string;
  role?: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface IAuthGateway {
  createUser(user: AuthUser): Promise<{ keycloakId: string }>;
  updateUserAttributes(keycloakId: string, attributes: Record<string, string[]>): Promise<void>;
  issueAccessToken(credentials: AuthCredentials): Promise<{ accessToken: string; refreshToken: string }>;
  logout(refreshToken: string): Promise<void>;
}
