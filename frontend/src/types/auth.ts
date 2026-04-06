export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
}

export type LoginCredentials = Pick<User, 'email'> & { password: string };
export type RegisterCredentials = Pick<User, 'email' | 'name'> & { password: string };
