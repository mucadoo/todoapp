import { api } from './axios';
import { LoginCredentials, RegisterCredentials, User, AuthResponse, ChangePasswordData } from '../types/auth';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // If we have an email, we send it, otherwise we send the username.
    // The backend's LoginSerializer will handle both.
    const payload = {
      password: credentials.password,
      ...(credentials.email ? { email: credentials.email } : { username: credentials.username })
    };
    const { data } = await api.post<AuthResponse>('/auth/login/', payload);
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
  updateProfile: async (data: { name: string; email: string }): Promise<User> => {
    const { data: updatedUser } = await api.patch<User>('/auth/me/', data);
    return updatedUser;
  },
  updateUsername: async (username: string): Promise<User> => {
    const { data } = await api.patch<User>('/auth/me/username/', { username });
    return data;
  },
  changePassword: async (data: ChangePasswordData): Promise<{ message: string }> => {
    const { data: response } = await api.put<{ message: string }>('/auth/me/password/', data);
    return response;
  },
  searchUsers: async (query: string): Promise<User[]> => {
    const { data } = await api.get<User[]>(`/auth/search/?search=${query}`);
    return data;
  },
  checkUsername: async (username: string, excludeId?: string): Promise<{ exists: boolean }> => {
    let url = `/auth/check-username/?username=${username}`;
    if (excludeId) url += `&exclude_id=${excludeId}`;
    const { data } = await api.get<{ exists: boolean }>(url);
    return data;
  },
  checkEmail: async (email: string, excludeId?: string): Promise<{ exists: boolean }> => {
    let url = `/auth/check-email/?email=${email}`;
    if (excludeId) url += `&exclude_id=${excludeId}`;
    const { data } = await api.get<{ exists: boolean }>(url);
    return data;
  },
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};
