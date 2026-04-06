import { User } from './auth';

export interface Category {
  id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  is_completed: boolean;
  due_date: string | null;
  priority: Priority;
  category: Category | null;
  category_id?: string | null; // For sending to backend
  owner: User;
  shared_with: User[];
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface TaskFilters {
  is_completed?: boolean;
  priority?: Priority;
  category?: string; // Category ID
  due_date_before?: string; // YYYY-MM-DD
  due_date_after?: string; // YYYY-MM-DD
  search?: string;
  page?: number;
  page_size?: number;
}
