import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Category } from '../types/tasks';
import { X, Trash2, Plus, ArrowLeft, Check } from 'lucide-react';
import { useCategories } from '../api/queries';
import { clsx } from 'clsx';
import { ConfirmationModal } from './ConfirmationModal';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ViewMode = 'list' | 'create' | 'edit';

export const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { categories, createCategory, updateCategory, deleteCategory } = useCategories();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<Partial<Category>>();

  const ownedCategories = useMemo(() => {
    if (!categories?.results) return [];
    return categories.results.filter(c => !c.is_shared);
  }, [categories]);

  useEffect(() => {
    if (editingCategory) {
      setValue('name', editingCategory.name);
      setValue('color', editingCategory.color);
    } else {
      reset({ name: '', color: '#6366f1' });
    }
  }, [editingCategory, setValue, reset]);

  useEffect(() => {
    if (!isOpen) {
      setViewMode('list');
      setEditingCategory(null);
      setCategoryToDelete(null);
      reset({ name: '', color: '#6366f1' });
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: Partial<Category>) => {
    try {
      if (viewMode === 'edit' && editingCategory) {
        await updateCategory({ id: editingCategory.id, category: data });
      } else {
        await createCategory(data);
      }
      setViewMode('list');
      setEditingCategory(null);
      reset({ name: '', color: '#6366f1' });
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setViewMode('edit');
  };

  const handleCreateClick = () => {
    setEditingCategory(null);
    setViewMode('create');
  };

  const handleDeleteCategory = async () => {
    if (categoryToDelete) {
      try {
        await deleteCategory(categoryToDelete);
        setCategoryToDelete(null);
        if (editingCategory?.id === categoryToDelete) {
          setViewMode('list');
          setEditingCategory(null);
        }
      } catch (error) {
        console.error('Failed to delete category:', error);
      }
    }
  };

  const goBack = () => {
    setViewMode('list');
    setEditingCategory(null);
    reset({ name: '', color: '#6366f1' });
  };

  return (
    <>
      <div 
        className={clsx(
          "fixed inset-0 z-50 overflow-hidden transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <div 
          className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-opacity" 
          onClick={onClose} 
        />

        <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
          <div 
            className={clsx(
              "w-screen max-w-md transform transition-transform duration-300 ease-in-out sm:duration-500",
              isOpen ? "translate-x-0" : "translate-x-full"
            )}
          >
            <div className="flex h-full flex-col bg-white dark:bg-gray-800 shadow-xl transition-colors duration-200">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0 bg-gray-50/50 dark:bg-gray-800/50">
                <div className="flex items-center space-x-2">
                  {viewMode !== 'list' && (
                    <button 
                      onClick={goBack}
                      className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                    >
                      <ArrowLeft size={20} />
                    </button>
                  )}
                  <h2 className="text-xl font-bold dark:text-white">
                    {viewMode === 'list' ? t('categories.title') : (viewMode === 'edit' ? t('categories.editCategory') : t('categories.newCategory'))}
                  </h2>
                </div>
                <button 
                  onClick={onClose} 
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto flex flex-col">
                {viewMode === 'list' ? (
                  <div className="p-6 space-y-6">
                    <button
                      onClick={handleCreateClick}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 shadow-sm transition-all active:scale-[0.98]"
                    >
                      <Plus size={18} />
                      <span>{t('categories.newCategory')}</span>
                    </button>

                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                        {t('common.all')}
                      </h3>
                      {ownedCategories.map((c) => (
                        <div 
                          key={c.id} 
                          onClick={() => handleEditClick(c)}
                          className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center space-x-3 overflow-hidden">
                            <div className="w-4 h-4 rounded-full shadow-sm shrink-0" style={{ backgroundColor: c.color }} />
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate">{c.name}</span>
                          </div>
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => { e.stopPropagation(); setCategoryToDelete(c.id); }}
                              className="p-1.5 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 transition-colors rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                              title={t('common.delete')}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                      {ownedCategories.length === 0 && (
                        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
                          <p className="text-sm text-gray-500 dark:text-gray-400">No categories yet.</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 flex flex-col flex-1">
                    <div className="flex-1 space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          {t('categories.name')}
                        </label>
                        <input
                          autoFocus
                          type="text"
                          {...register('name', { required: true })}
                          className={clsx(
                            "block w-full px-4 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-base bg-white dark:bg-gray-700 dark:text-white",
                            errors.name ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                          )}
                          placeholder="Work, Personal..."
                        />
                        {errors.name && <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">Name is required</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          {t('categories.color')}
                        </label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            {...register('color')}
                            className="h-10 w-20 border border-gray-300 dark:border-gray-600 rounded-lg p-1 block cursor-pointer bg-white dark:bg-gray-700 transition-colors"
                          />
                          <span className="text-sm text-gray-500 dark:text-gray-400 font-mono uppercase">
                            {editingCategory?.color || '#6366f1'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-gray-100 dark:border-gray-700 mt-auto">
                      <button
                        type="button"
                        onClick={goBack}
                        className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                      >
                        {t('common.cancel')}
                      </button>
                      <button
                        type="submit"
                        className="flex-1 flex items-center justify-center space-x-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 shadow-sm shadow-indigo-200 dark:shadow-none transition-all active:scale-[0.98]"
                      >
                        <Check size={18} />
                        <span>{viewMode === 'edit' ? t('common.save') : t('common.create')}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleDeleteCategory}
        title={t('categories.deleteConfirmTitle')}
        message={t('categories.deleteConfirmMessage')}
        variant="danger"
      />
    </>
  );
};
