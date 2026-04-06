import React from 'react';
import { useForm } from 'react-hook-form';
import { Category } from '../types/tasks';
import { X, Trash2 } from 'lucide-react';
import { useCategories } from '../api/queries';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose }) => {
  const { categories, createCategory, deleteCategory } = useCategories();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Partial<Category>>();

  const onSubmit = async (data: Partial<Category>) => {
    try {
      await createCategory(data);
      reset({ name: '', color: '#000000' });
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold">Manage Categories</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Category Name</label>
                <input
                  type="text"
                  {...register('name', { required: 'Name is required' })}
                  className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="Work, Personal..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Color</label>
                <input
                  type="color"
                  {...register('color')}
                  defaultValue="#000000"
                  className="mt-1 h-9 w-12 border rounded-md p-1 block focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
              >
                Add
              </button>
            </div>
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </form>

          <div className="max-h-64 overflow-y-auto space-y-2">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Your Categories</h3>
            {categories?.results.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-2 border rounded-md">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-sm font-medium">{c.name}</span>
                </div>
                <button
                  onClick={() => deleteCategory(c.id)}
                  className="text-gray-400 hover:text-red-600"
                  title="Delete Category"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {categories?.results.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No categories yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
