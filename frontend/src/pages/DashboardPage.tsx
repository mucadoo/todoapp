import React, { useState } from 'react';
import { useAuth, useTasks } from '../api/queries';
import { Sidebar } from '../components/Sidebar';
import { FilterBar } from '../components/FilterBar';
import { TaskCard } from '../components/TaskCard';
import { TaskModal } from '../components/TaskModal';
import { CategoryModal } from '../components/CategoryModal';
import { TaskFilters, Task } from '../types/tasks';
import { Plus } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [filters, setFilters] = useState<TaskFilters>({ page: 1, page_size: 10 });
  const { tasks, isLoading, toggleTask, deleteTask, createTask, updateTask } = useTasks(filters);
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleFilterChange = (newFilters: Partial<TaskFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleCategorySelect = (categoryId?: string) => {
    setFilters((prev) => ({ ...prev, category: categoryId, page: 1 }));
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
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        currentCategory={filters.category}
        onCategorySelect={handleCategorySelect}
        onLogout={() => logout()}
        onAddCategory={() => setIsCategoryModalOpen(true)}
      />

      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-200 py-4 px-8 flex justify-between items-center sticky top-0 z-10">
          <h1 className="text-2xl font-bold text-gray-900">
            {filters.category ? 'Category Tasks' : 'All Tasks'}
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Hi, {user?.name}</span>
            <button
              onClick={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus size={18} />
              <span>New Task</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-8 space-y-6">
          <FilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            count={tasks?.count || 0}
          />

          {isLoading ? (
            <div className="flex justify-center items-center h-64 text-gray-400">Loading tasks...</div>
          ) : tasks?.results.length === 0 ? (
            <div className="bg-white p-12 rounded-lg shadow-sm border text-center text-gray-500">
              <p className="text-lg font-medium">No tasks found.</p>
              <p className="text-sm">Try adjusting your filters or create a new task!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
