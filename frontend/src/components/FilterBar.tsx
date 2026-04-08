import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TaskFilters, Priority } from '../types/tasks';
import { Search, SlidersHorizontal, ChevronUp, ArrowUpDown } from 'lucide-react';
import { useDebounce } from '../utils/hooks';
import { clsx } from 'clsx';

interface FilterBarProps {
  filters: TaskFilters;
  onFilterChange: (filters: Partial<TaskFilters>) => void;
  count: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange, count }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(filters.search || '');
  const debouncedSearchQuery = useDebounce(localSearchQuery, 500); // Debounce for 500ms

  useEffect(() => {
    // Update parent filter only when debounced search query changes
    if (debouncedSearchQuery !== filters.search) {
      onFilterChange({ search: debouncedSearchQuery || undefined });
    }
  }, [debouncedSearchQuery, filters.search, onFilterChange]);

  useEffect(() => {
    // Keep local state in sync with external filter changes (e.g., clear filters)
    if (filters.search !== localSearchQuery) {
      setLocalSearchQuery(filters.search || '');
    }
  }, [filters.search, localSearchQuery]);

  const handleLocalSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchQuery(e.target.value);
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
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        {/* Search Input and Expand Toggle */}
        <div className="flex items-center gap-2 flex-grow md:flex-grow-0 md:w-64">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
            <input
              type="text"
              placeholder={t('common.search')}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-colors"
              value={localSearchQuery}
              onChange={handleLocalSearchChange}
            />
          </div>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 md:hidden transition-colors shrink-0"
          >
            {isExpanded ? <ChevronUp size={20} /> : <SlidersHorizontal size={20} />}
          </button>
        </div>

        {/* Filters Group */}
        <div className={clsx(
          "w-full md:w-auto items-center gap-3 sm:gap-4 flex-wrap",
          isExpanded ? "flex" : "hidden md:flex"
        )}>
          <div className="flex-1 md:flex-none">
            <select
              className="w-full md:w-40 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              onChange={handleStatusChange}
              value={filters.is_completed === undefined ? 'all' : filters.is_completed ? 'completed' : 'active'}
            >
              <option value="all">{t('common.all')} ({t('tasks.status')})</option>
              <option value="active">{t('tasks.pending')}</option>
              <option value="completed">{t('tasks.completed')}</option>
            </select>
          </div>

          <div className="flex-1 md:flex-none">
            <select
              className="w-full md:w-40 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              onChange={handlePriorityChange}
              value={filters.priority || 'all'}
            >
              <option value="all">{t('tasks.allPriorities')}</option>
              <option value="low">{t('tasks.low')}</option>
              <option value="medium">{t('tasks.medium')}</option>
              <option value="high">{t('tasks.high')}</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto text-sm">
            <input
              type="date"
              className="flex-1 lg:w-36 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              value={filters.due_date_after || ''}
              onChange={(e) => handleDateChange('due_date_after', e.target.value)}
            />
            <span className="text-gray-400 dark:text-gray-500">to</span>
            <input
              type="date"
              className="flex-1 lg:w-36 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              value={filters.due_date_before || ''}
              onChange={(e) => handleDateChange('due_date_before', e.target.value)}
            />
          </div>

          <div className="w-full md:w-auto relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-500 z-10">
              <ArrowUpDown size={16} />
            </div>
            <select
              className="w-full md:w-48 text-sm pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors appearance-none"
              onChange={handleOrderingChange}
              value={filters.ordering || '-created_at'}
            >
              <option value="-created_at">{t('tasks.sortBy.createdAtDesc')}</option>
              <option value="created_at">{t('tasks.sortBy.createdAtAsc')}</option>
              <option value="due_date">{t('tasks.sortBy.dueDateAsc')}</option>
              <option value="-due_date">{t('tasks.sortBy.dueDateDesc')}</option>
              <option value="-priority">{t('tasks.sortBy.priorityDesc')}</option>
              <option value="priority">{t('tasks.sortBy.priorityAsc')}</option>
              <option value="title">{t('tasks.sortBy.titleAsc')}</option>
              <option value="-title">{t('tasks.sortBy.titleDesc')}</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-500">
              <ChevronUp size={16} className="rotate-180" />
            </div>
          </div>
        </div>

        {/* Count */}
        <div className="hidden xl:block text-sm text-gray-500 dark:text-gray-400 border-l border-gray-200 dark:border-gray-700 pl-4 ml-auto transition-colors shrink-0">
          {count} {t('tasks.title', { count }).toLowerCase()}
        </div>
      </div>
    </div>
  );
};
