import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth, useTasks } from '../api/queries';
import { Sidebar } from '../components/Sidebar';
import { FilterBar } from '../components/FilterBar';
import { TaskCard } from '../components/TaskCard';
import { TaskModal } from '../components/TaskModal';
import { CategoryModal } from '../components/CategoryModal';
import { TaskFilters, Task } from '../types/tasks';
import { Plus, Loader2, Menu } from 'lucide-react';
import { TaskCardSkeleton } from '../components/Skeleton';


export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filters, setFilters] = useState<TaskFilters>(() => ({ 
    page: 1, 
    page_size: 30 
  }));
  const { 
    tasks, 
    isLoading, 
    toggleTask, 
    deleteTask, 
    createTask, 
    updateTask,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useTasks(filters);
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '200px' // Industry standard for a smooth pre-fetch
      }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleFilterChange = (newFilters: Partial<TaskFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleCategorySelect = (categoryId?: string) => {
    setFilters((prev) => ({ ...prev, category: categoryId }));
  };

  const handleCreateOrUpdateTask = async (data: Partial<Task>) => {
    try {
      if (editingTask) {
        await updateTask({ id: editingTask.id, task: data });
      } else {
        await createTask(data);
      }
      setIsTaskModalOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  const openEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      <Sidebar
        currentCategory={filters.category}
        onCategorySelect={handleCategorySelect}
        onLogout={() => logout()}
        onAddCategory={() => setIsCategoryModalOpen(true)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-200 py-4 px-4 sm:px-8 flex justify-between items-center sticky top-0 z-20">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-gray-600 lg:hidden hover:bg-gray-100 rounded-md"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate max-w-[150px] sm:max-w-none">
              {filters.category ? t('tasks.category') : t('tasks.title')}
            </h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <span className="hidden sm:inline text-sm font-medium text-gray-700">Hi, {user?.name}</span>
            <button
              onClick={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
              className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus size={18} />
              <span className="hidden xs:inline">{t('tasks.newTask')}</span>
              <span className="xs:hidden">{t('common.create')}</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 space-y-6">
          <FilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            count={tasks?.count || 0}
          />

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <TaskCardSkeleton key={i} />
              ))}
            </div>
          ) : tasks?.results.length === 0 ? (
            <div className="bg-white p-12 rounded-lg shadow-sm border text-center text-gray-500">
              <p className="text-lg font-medium">No tasks found.</p>
              <p className="text-sm">Try adjusting your filters or create a new task!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {tasks?.results.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={toggleTask}
                    onDelete={deleteTask}
                    onEdit={openEditTask}
                  />
                ))}
              </div>
              
              <div ref={loadMoreRef} className="py-8 flex justify-center">
                {isFetchingNextPage && (
                  <div className="flex items-center space-x-2 text-gray-500">
                    <Loader2 className="animate-spin" size={24} />
                    <span>{t('common.loading')}</span>
                  </div>
                )}
                {!hasNextPage && tasks && tasks.results.length > 0 && (
                  <p className="text-gray-400 text-sm">{t('common.noMoreTasks')}</p>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      <TaskModal
        isOpen={isTaskModalOpen}
        task={editingTask}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleCreateOrUpdateTask}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />
    </div>
  );
};
