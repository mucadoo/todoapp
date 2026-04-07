import { api } from './axios';
import { Task, Category, TaskFilters, PaginatedResponse } from '../types/tasks';

export const tasksApi = {
  // Category Endpoints
  getCategories: async (): Promise<PaginatedResponse<Category>> => {
    const { data } = await api.get<PaginatedResponse<Category>>('/categories/');
    return data;
  },
  createCategory: async (category: Partial<Category>): Promise<Category> => {
    const { data } = await api.post<Category>('/categories/', category);
    return data;
  },
  updateCategory: async (id: string, category: Partial<Category>): Promise<Category> => {
    const { data } = await api.patch<Category>(`/categories/${id}/`, category);
    return data;
  },
  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}/`);
  },

  // Task Endpoints
  getTasks: async (filters: TaskFilters = {}): Promise<PaginatedResponse<Task>> => {
    const { data } = await api.get<PaginatedResponse<Task>>('/tasks/', { params: filters });
    return data;
  },
  getTask: async (id: string): Promise<Task> => {
    const { data } = await api.get<Task>(`/tasks/${id}/`);
    return data;
  },
  createTask: async (task: Partial<Task>): Promise<Task> => {
    const { data } = await api.post<Task>('/tasks/', task);
    return data;
  },
  updateTask: async (id: string, task: Partial<Task>): Promise<Task> => {
    const { data } = await api.patch<Task>(`/tasks/${id}/`, task);
    return data;
  },
  deleteTask: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}/`);
  },
  toggleTask: async (id: string): Promise<{ is_completed: boolean }> => {
    const { data } = await api.post<{ is_completed: boolean }>(`/tasks/${id}/toggle/`);
    return data;
  },
};
