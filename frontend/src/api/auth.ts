import { api } from './axios';
import { LoginCredentials, RegisterCredentials, User, AuthResponse } from '../types/auth';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login/', credentials);
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    return data;
  },
  register: async (credentials: RegisterCredentials): Promise<User> => {
    const { data } = await api.post<User>('/auth/register/', credentials);
    return data;
  },
  me: async (): Promise<User> => {
    const { data } = await api.get<User>('/auth/me/');
    return data;
  },
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};
