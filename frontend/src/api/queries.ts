import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { authApi } from './auth';
import { tasksApi } from './tasks';
import { TaskFilters, Task, Category } from '../types/tasks';
import { useToast } from '../components/Toast';
import { User } from '../types/auth';

export const useAuth = () => {
  const queryClient = useQueryClient();

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['me'],
    queryFn: authApi.me,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 mins
    enabled: !!localStorage.getItem('access_token'),
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => authApi.logout(),
    onSuccess: () => {
      queryClient.setQueryData(['me'], null);
      queryClient.clear();
    },
  });

  const searchUsersQuery = (searchQuery: string) => useQuery<User[], Error>({
    queryKey: ['users', searchQuery],
    queryFn: () => authApi.searchUsers(searchQuery),
    enabled: !!searchQuery,
  });

  return {
    user,
    isLoading,
    isError,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    searchUsersQuery,
  };
};

export const useTasks = (filters: TaskFilters = {}) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { showToast } = useToast();

  const {
    data: tasksData,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['tasks', filters],
    queryFn: ({ pageParam = 1 }) => tasksApi.getTasks({ ...filters, page: pageParam as number }),
    getNextPageParam: (lastPage) => {
      if (!lastPage.next) return undefined;
      const url = new URL(lastPage.next);
      const page = url.searchParams.get('page');
      return page ? parseInt(page) : undefined;
    },
    initialPageParam: 1,
  });

  const tasks = tasksData ? {
    count: tasksData.pages[0].count,
    results: tasksData.pages.flatMap(page => page.results),
    next: tasksData.pages[tasksData.pages.length - 1].next,
    previous: tasksData.pages[0].previous,
  } : undefined;

  const createTaskMutation = useMutation({
    mutationFn: tasksApi.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      showToast(t('tasks.createSuccess'), 'success');
    },
    onError: () => {
      showToast(t('tasks.genericError'), 'error');
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, task }: { id: string; task: Partial<Task> }) => tasksApi.updateTask(id, task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      showToast(t('tasks.updateSuccess'), 'success');
    },
    onError: () => {
      showToast(t('tasks.genericError'), 'error');
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => tasksApi.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      showToast(t('tasks.deleteSuccess'), 'success');
    },
    onError: () => {
      showToast(t('tasks.genericError'), 'error');
    },
  });

  const toggleTaskMutation = useMutation({
    mutationFn: (id: string) => tasksApi.toggleTask(id),
    // Optimistic Update
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasksData = queryClient.getQueryData(['tasks', filters]);

      queryClient.setQueryData(['tasks', filters], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            results: page.results.map((task: Task) =>
              task.id === id ? { ...task, is_completed: !task.is_completed } : task
            ),
          })),
        };
      });

      return { previousTasksData };
    },
    onError: (_err, _id, context) => {
      queryClient.setQueryData(['tasks', filters], context?.previousTasksData);
      showToast(t('tasks.genericError'), 'error');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  return {
    tasks,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    createTask: createTaskMutation.mutateAsync,
    updateTask: updateTaskMutation.mutateAsync,
    deleteTask: deleteTaskMutation.mutateAsync,
    toggleTask: toggleTaskMutation.mutateAsync,
  };
};

export const useCategories = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { showToast } = useToast();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: tasksApi.getCategories,
  });

  const createCategoryMutation = useMutation({
    mutationFn: tasksApi.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      showToast(t('categories.createSuccess'), 'success');
    },
    onError: () => {
      showToast(t('categories.genericError'), 'error');
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, category }: { id: string; category: Partial<Category> }) =>
      tasksApi.updateCategory(id, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      showToast(t('categories.updateSuccess'), 'success');
    },
    onError: () => {
      showToast(t('categories.genericError'), 'error');
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => tasksApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      showToast(t('categories.deleteSuccess'), 'success');
    },
    onError: () => {
      showToast(t('categories.genericError'), 'error');
    },
  });

  return {
    categories,
    isLoading,
    createCategory: createCategoryMutation.mutateAsync,
    updateCategory: updateCategoryMutation.mutateAsync,
    deleteCategory: deleteCategoryMutation.mutateAsync,
  };
};

export const useTaskShare = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { showToast } = useToast();

  const shareTaskMutation = useMutation({
    mutationFn: ({ id, email }: { id: string; email: string }) => tasksApi.shareTask(id, email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      showToast(t('tasks.shareSuccess'), 'success');
    },
    onError: () => {
      showToast(t('tasks.genericError'), 'error');
    },
  });

  const unshareTaskMutation = useMutation({
    mutationFn: ({ id, email }: { id: string; email: string }) => tasksApi.unshareTask(id, email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      showToast(t('tasks.unshareSuccess'), 'success');
    },
    onError: () => {
      showToast(t('tasks.genericError'), 'error');
    },
  });

  return {
    shareTask: shareTaskMutation.mutateAsync,
    unshareTask: unshareTaskMutation.mutateAsync,
    isSharing: shareTaskMutation.isPending,
    isUnsharing: unshareTaskMutation.isPending,
  };
};
