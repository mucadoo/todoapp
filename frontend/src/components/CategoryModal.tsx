import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Category } from '../types/tasks';
import { X, Trash2, Plus, Edit2 } from 'lucide-react';
import { useCategories, useAuth } from '../api/queries';
import { clsx } from 'clsx';
import { ConfirmationModal } from './ConfirmationModal';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const { categories, createCategory, updateCategory, deleteCategory } = useCategories();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<Partial<Category>>();

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
      setEditingCategory(null);
      setCategoryToDelete(null);
      reset({ name: '', color: '#6366f1' });
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: Partial<Category>) => {
    try {
      if (editingCategory) {
        await updateCategory({ id: editingCategory.id, category: data });
        setEditingCategory(null);
      } else {
        await createCategory(data);
      }
      reset({ name: '', color: '#6366f1' });
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  const handleEditClick = (category: Category) => {
    const isOwner = currentUser?.id === category.owner?.id;
    if (isOwner) {
      setEditingCategory(category);
    }
  };

  const handleDeleteCategory = async () => {
    if (categoryToDelete) {
      try {
        await deleteCategory(categoryToDelete);
        setCategoryToDelete(null);
      } catch (error) {
        console.error('Failed to delete category:', error);
      }
    }
  };

  const cancelEdit = () => {
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
        {/* Backdrop */}
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
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('categories.title')}</h2>
                <button 
                  onClick={onClose} 
                  className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Form Section */}
                <section className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    {editingCategory ? <Edit2 size={16} /> : <Plus size={16} />}
                    {editingCategory ? t('common.edit') : t('categories.manageCategories')}
                  </h3>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('categories.name')}</label>
                        <input
                          type="text"
                          {...register('name', { required: true })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-colors"
                          placeholder="Work, Personal..."
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-600">Name is required</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('categories.color')}</label>
                        <div className="mt-1 flex items-center gap-3">
                          <input
                            type="color"
                            {...register('color')}
                            className="h-10 w-20 border border-gray-300 dark:border-gray-600 rounded-md p-1 block cursor-pointer bg-white dark:bg-gray-700 transition-colors"
                          />
                          <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            {editingCategory ? t('common.save') : t('common.create')}
                          </button>
                          {editingCategory && (
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                            >
                              {t('common.cancel')}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </form>
                </section>

                {/* Category List */}
                <section className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('categories.title')}
                  </h3>
                  <div className="space-y-2">
                    {categories?.results.map((c) => {
                      const isOwner = currentUser?.id === c.owner?.id;
                      return (
                        <div 
                          key={c.id} 
                          onClick={() => isOwner && handleEditClick(c)}
                          className={clsx(
                            "flex items-center justify-between p-3 border rounded-lg transition-colors group",
                            isOwner && "cursor-pointer",
                            editingCategory?.id === c.id 
                              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" 
                              : (isOwner ? "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50" : "border-gray-100 dark:border-gray-800 opacity-80")
                          )}
                        >
                          <div className="flex items-center space-x-3 overflow-hidden">
                            <div className="w-4 h-4 rounded-full shadow-sm shrink-0" style={{ backgroundColor: c.color }} />
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate">{c.name}</span>
                              {!isOwner && c.owner && (
                                <span className="text-[10px] text-gray-400 truncate">{c.owner.name || c.owner.username}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {isOwner && (
                              <>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleEditClick(c); }}
                                  className="p-1.5 text-gray-400 hover:text-indigo-600 dark:text-gray-500 dark:hover:text-indigo-400 transition-colors rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                                  title={t('common.edit')}
                                >
                                  <Edit2 size={18} />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setCategoryToDelete(c.id); }}
                                  className="p-1.5 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 transition-colors rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                                  title={t('common.delete')}
                                >
                                  <Trash2 size={18} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {categories?.results.length === 0 && (
                      <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                        <p className="text-sm text-gray-400 dark:text-gray-500">No categories yet.</p>
                      </div>
                    )}
                  </div>
                </section>
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
