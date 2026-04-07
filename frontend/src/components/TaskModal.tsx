import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Task } from '../types/tasks';
import { useCategories } from '../api/queries';
import { X, Clock, Search, Check, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

interface TaskModalProps {
  task?: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Task>) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ task, isOpen, onClose, onSubmit }) => {
  const { t } = useTranslation();
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<Partial<Task>>();
  const { categories } = useCategories();
  const [includeTime, setIncludeTime] = useState(false);
  
  // Custom Category Select State
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const categoryId = watch('category_id');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (task) {
      setIncludeTime(task.has_time);
      reset({
        title: task.title,
        description: task.description,
        priority: task.priority,
        category_id: task.category?.id,
        due_date: task.due_date ? (task.has_time ? task.due_date.substring(0, 16) : task.due_date.split('T')[0]) : '',
        has_time: task.has_time,
      });
    } else {
      setIncludeTime(false);
      reset({
        title: '',
        description: '',
        priority: 'medium',
        category_id: undefined,
        due_date: '',
        has_time: false,
      });
    }
  }, [task, reset, isOpen]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleFormSubmit = (data: Partial<Task>) => {
    const sanitizedData = {
      ...data,
      category_id: data.category_id || null,
      due_date: data.due_date || null,
      has_time: includeTime,
    };
    onSubmit(sanitizedData);
  };

  const filteredCategories = categories?.results.filter(c => 
    c.name.toLowerCase().includes(categorySearch.toLowerCase())
  ) || [];

  const selectedCategory = categories?.results.find(c => c.id === categoryId);

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4 transition-all backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col transition-colors duration-200">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0 bg-gray-50/50 dark:bg-gray-800/50">
          <h2 className="text-xl font-bold dark:text-white">{task ? t('tasks.editTask') : t('tasks.newTask')}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-5 overflow-y-auto flex-1">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{t('tasks.taskTitle')}</label>
            <input
              type="text"
              {...register('title', { required: true })}
              className={clsx(
                "block w-full px-4 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-base bg-white dark:bg-gray-700 dark:text-white",
                errors.title ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              )}
              placeholder="e.g. Finish project proposal"
            />
            {errors.title && <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">Title is required</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{t('tasks.description')}</label>
            <textarea
              {...register('description')}
              rows={3}
              className="block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
              placeholder="Add more details..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{t('tasks.priority')}</label>
              <div className="relative">
                <select
                  {...register('priority')}
                  className="appearance-none block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                >
                  <option value="low">{t('tasks.low')}</option>
                  <option value="medium">{t('tasks.medium')}</option>
                  <option value="high">{t('tasks.high')}</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{t('tasks.category')}</label>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className="flex items-center justify-between w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                >
                  <span className="flex items-center gap-2 truncate text-sm sm:text-base">
                    {selectedCategory ? (
                      <>
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: selectedCategory.color }} />
                        <span className="truncate">{selectedCategory.name}</span>
                      </>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">{t('tasks.noCategory')}</span>
                    )}
                  </span>
                  <ChevronDown size={18} className={clsx("text-gray-400 transition-transform flex-shrink-0 ml-1", isCategoryOpen && "rotate-180")} />
                </button>

                {isCategoryOpen && (
                  <div className="absolute z-[60] mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top">
                    <div className="p-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center px-3 gap-2 sticky top-0">
                      <Search size={14} className="text-gray-400" />
                      <input
                        type="text"
                        className="bg-transparent border-none focus:ring-0 text-xs w-full py-1 dark:text-white p-0 outline-none"
                        placeholder="Search..."
                        autoFocus
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') setIsCategoryOpen(false);
                        }}
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                      <button
                        type="button"
                        onClick={() => {
                          setValue('category_id', undefined);
                          setIsCategoryOpen(false);
                          setCategorySearch('');
                        }}
                        className={clsx(
                          "flex items-center justify-between w-full px-3 py-2 text-sm rounded-md transition-colors",
                          !categoryId ? "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        )}
                      >
                        <span>{t('tasks.noCategory')}</span>
                        {!categoryId && <Check size={14} />}
                      </button>
                      {filteredCategories.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setValue('category_id', c.id);
                            setIsCategoryOpen(false);
                            setCategorySearch('');
                          }}
                          className={clsx(
                            "flex items-center justify-between w-full px-3 py-2 text-sm rounded-md transition-colors",
                            categoryId === c.id ? "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          )}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                            <span className="truncate">{c.name}</span>
                          </div>
                          {categoryId === c.id && <Check size={14} />}
                        </button>
                      ))}
                      {filteredCategories.length === 0 && categorySearch && (
                        <div className="px-3 py-4 text-center text-xs text-gray-500 dark:text-gray-400 italic">
                          No results
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">{t('tasks.dueDate')}</label>
              <button
                type="button"
                onClick={() => setIncludeTime(!includeTime)}
                className={clsx(
                  "flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-md transition-all",
                  includeTime ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" : "bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                )}
              >
                <Clock size={14} />
                <span>{includeTime ? t('tasks.removeTime') : t('tasks.addTime')}</span>
              </button>
            </div>
            <input
              type={includeTime ? "datetime-local" : "date"}
              {...register('due_date')}
              className="block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Spacer to handle dropdown overflow in the scrollable form */}
          {isCategoryOpen && <div className="h-32 sm:hidden" />}

          <div className="pt-6 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-gray-100 dark:border-gray-700 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 shadow-sm shadow-indigo-200 dark:shadow-none transition-all active:scale-[0.98]"
            >
              {task ? t('common.save') : t('common.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
