export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  created_at: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
}

export type LoginCredentials = { 
  email?: string; 
  username?: string; 
  password: string 
};

export type RegisterCredentials = Pick<User, 'email' | 'name' | 'username'> & { password: string };
