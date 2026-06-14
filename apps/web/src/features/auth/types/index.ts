export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
  roles?: string[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface LoginDto {
  email: string;
  password?: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password?: string;
}
