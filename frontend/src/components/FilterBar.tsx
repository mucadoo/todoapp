import React, { useState } from 'react';
import { TaskFilters, Priority } from '../types/tasks';
import { Search, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';

interface FilterBarProps {
  filters: TaskFilters;
  onFilterChange: (filters: Partial<TaskFilters>) => void;
  count: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange, count }) => {
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

  const handleDateChange = (field: 'due_date_after' | 'due_date_before', value: string) => {
    onFilterChange({ [field]: value || undefined });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
      <div className="flex items-center space-x-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search tasks..."
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            value={filters.search || ''}
            onChange={handleSearch}
          />
        </div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 border rounded-md text-gray-600 hover:bg-gray-50 md:hidden"
        >
          {isExpanded ? <ChevronUp size={20} /> : <SlidersHorizontal size={20} />}
        </button>
      </div>

      <div className={`${isExpanded ? 'flex' : 'hidden'} md:flex flex-wrap items-center gap-4`}>
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <SlidersHorizontal size={18} className="text-gray-400 hidden md:block" />
          <select
            className="text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 md:w-40"
            onChange={handleStatusChange}
            value={filters.is_completed === undefined ? 'all' : filters.is_completed ? 'completed' : 'active'}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <select
          className="text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-40"
          onChange={handlePriorityChange}
          value={filters.priority || 'all'}
        >
          <option value="all">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <input
            type="date"
            className="text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 md:w-auto"
            placeholder="From"
            value={filters.due_date_after || ''}
            onChange={(e) => handleDateChange('due_date_after', e.target.value)}
          />
          <span className="text-gray-400 text-sm">to</span>
          <input
            type="date"
            className="text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 md:w-auto"
            placeholder="To"
            value={filters.due_date_before || ''}
            onChange={(e) => handleDateChange('due_date_before', e.target.value)}
          />
        </div>

        <div className="hidden md:block text-sm text-gray-500 border-l pl-4 ml-auto">
          {count} tasks
        </div>
      </div>
    </div>
  );
};
