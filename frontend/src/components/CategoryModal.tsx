import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Category } from '../types/tasks';
import { X, Trash2, Plus, ArrowLeft, Check, Palette } from 'lucide-react';
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

  // Reset state when drawer closes
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
            <div className="flex h-full flex-col bg-white dark:bg-gray-800 shadow-2xl">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center space-x-2">
                  {viewMode !== 'list' && (
                    <button 
                      onClick={goBack}
                      className="p-1.5 -ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      <ArrowLeft size={20} />
                    </button>
                  )}
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {viewMode === 'list' ? t('categories.title') : (viewMode === 'edit' ? t('categories.editCategory') : t('categories.newCategory'))}
                  </h2>
                </div>
                <button 
                  onClick={onClose} 
                  className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {viewMode === 'list' ? (
                  <div className="p-6 space-y-6">
                    <button
                      onClick={handleCreateClick}
                      className="w-full flex items-center justify-center space-x-2 py-3 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all group"
                    >
                      <Plus size={20} className="group-hover:scale-110 transition-transform" />
                      <span className="font-semibold">{t('categories.newCategory')}</span>
                    </button>

                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">
                        {t('common.all')}
                      </h3>
                      {ownedCategories.map((c) => (
                        <div 
                          key={c.id} 
                          onClick={() => handleEditClick(c)}
                          className="group flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-indigo-500/50 hover:bg-white dark:hover:bg-gray-700 transition-all cursor-pointer shadow-sm hover:shadow-md"
                        >
                          <div className="flex items-center space-x-4 overflow-hidden">
                            <div className="w-5 h-5 rounded-lg shadow-sm shrink-0 border-2 border-white dark:border-gray-600" style={{ backgroundColor: c.color }} />
                            <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">{c.name}</span>
                          </div>
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => { e.stopPropagation(); setCategoryToDelete(c.id); }}
                              className="p-2 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                              title={t('common.delete')}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                      {ownedCategories.length === 0 && (
                        <div className="text-center py-16 px-4">
                          <div className="bg-gray-100 dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Palette size={32} className="text-gray-400" />
                          </div>
                          <p className="text-gray-500 dark:text-gray-400 font-medium">No categories yet.</p>
                          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Create one to organize your tasks!</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="p-6 h-full flex flex-col">
                    <div className="flex-1 space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
                          {t('categories.name')}
                        </label>
                        <input
                          autoFocus
                          type="text"
                          {...register('name', { required: true })}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-medium"
                          placeholder="e.g. Work, Shopping, Gym..."
                        />
                        {errors.name && <p className="text-xs text-red-500 ml-1">Name is required</p>}
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
                          {t('categories.color')}
                        </label>
                        <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl">
                          <input
                            type="color"
                            {...register('color')}
                            className="h-12 w-12 rounded-lg border-0 p-0 bg-transparent cursor-pointer overflow-hidden"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white uppercase">Hex Code</p>
                            <code className="text-xs text-gray-500 dark:text-gray-400">
                              {register('color').value || '#6366f1'}
                            </code>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 dark:border-gray-700 mt-auto flex space-x-3">
                      <button
                        type="button"
                        onClick={goBack}
                        className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        {t('common.cancel')}
                      </button>
                      <button
                        type="submit"
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all"
                      >
                        <Check size={20} />
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
