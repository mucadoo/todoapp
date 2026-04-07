import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TaskFilters, Priority } from '../types/tasks';
import { Search, SlidersHorizontal, ChevronUp, ArrowUpDown } from 'lucide-react';

interface FilterBarProps {
  filters: TaskFilters;
  onFilterChange: (filters: Partial<TaskFilters>) => void;
  count: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange, count }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ search: e.target.value });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onFilterChange({
      is_completed: value === 'all' ? undefined : value === 'completed',
    });
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onFilterChange({
      priority: value === 'all' ? undefined : (value as Priority),
    });
  };

  const handleOrderingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ordering: e.target.value || undefined });
  };

  const handleDateChange = (field: 'due_date_after' | 'due_date_before', value: string) => {
    onFilterChange({ [field]: value || undefined });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 space-y-4 transition-colors duration-200">
      <div className="flex items-center space-x-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
          <input
            type="text"
            placeholder={t('common.search')}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-colors"
            value={filters.search || ''}
            onChange={handleSearch}
          />
        </div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 md:hidden transition-colors"
        >
          {isExpanded ? <ChevronUp size={20} /> : <SlidersHorizontal size={20} />}
        </button>
      </div>

      <div className={`${isExpanded ? 'flex' : 'hidden'} md:flex flex-wrap items-center gap-4`}>
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <SlidersHorizontal size={18} className="text-gray-400 dark:text-gray-500 hidden md:block" />
          <select
            className="text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 md:w-40 transition-colors"
            onChange={handleStatusChange}
            value={filters.is_completed === undefined ? 'all' : filters.is_completed ? 'completed' : 'active'}
          >
            <option value="all">{t('common.all')} ({t('tasks.status')})</option>
            <option value="active">{t('tasks.pending')}</option>
            <option value="completed">{t('tasks.completed')}</option>
          </select>
        </div>

        <select
          className="text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-40 transition-colors"
          onChange={handlePriorityChange}
          value={filters.priority || 'all'}
        >
          <option value="all">{t('tasks.allPriorities')}</option>
          <option value="low">{t('tasks.low')}</option>
          <option value="medium">{t('tasks.medium')}</option>
          <option value="high">{t('tasks.high')}</option>
        </select>

        <div className="flex items-center space-x-2 w-full md:w-auto text-sm">
          <input
            type="date"
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 md:w-auto transition-colors"
            value={filters.due_date_after || ''}
            onChange={(e) => handleDateChange('due_date_after', e.target.value)}
          />
          <span className="text-gray-400 dark:text-gray-500">to</span>
          <input
            type="date"
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 md:w-auto transition-colors"
            value={filters.due_date_before || ''}
            onChange={(e) => handleDateChange('due_date_before', e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <ArrowUpDown size={18} className="text-gray-400 dark:text-gray-500 hidden md:block" />
          <select
            className="text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 md:w-48 transition-colors"
            onChange={handleOrderingChange}
            value={filters.ordering || ''}
          >
            <option value="">{t('common.ordering')}</option>
            <option value="-created_at">{t('tasks.sortBy.createdAtDesc')}</option>
            <option value="created_at">{t('tasks.sortBy.createdAtAsc')}</option>
            <option value="due_date">{t('tasks.sortBy.dueDateAsc')}</option>
            <option value="-due_date">{t('tasks.sortBy.dueDateDesc')}</option>
            <option value="-priority">{t('tasks.sortBy.priorityDesc')}</option>
            <option value="priority">{t('tasks.sortBy.priorityAsc')}</option>
            <option value="title">{t('tasks.sortBy.titleAsc')}</option>
            <option value="-title">{t('tasks.sortBy.titleDesc')}</option>
          </select>
        </div>

        <div className="hidden md:block text-sm text-gray-500 dark:text-gray-400 border-l border-gray-200 dark:border-gray-700 pl-4 ml-auto transition-colors">
          {count} {t('tasks.title').toLowerCase()}
        </div>
      </div>
    </div>
  );
};
