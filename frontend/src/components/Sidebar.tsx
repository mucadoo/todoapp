import React from 'react';
import { useCategories } from '../api/queries';
import { LayoutDashboard, FolderOpen, LogOut, PlusCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface SidebarProps {
  currentCategory?: string;
  onCategorySelect: (id?: string) => void;
  onLogout: () => void;
  onAddCategory: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentCategory,
  onCategorySelect,
  onLogout,
  onAddCategory,
}) => {
  const { categories, isLoading } = useCategories();

  return (
    <aside className="w-64 bg-white h-screen border-r border-gray-200 flex flex-col fixed left-0 top-0 pt-16">
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <div>
          <button
            onClick={() => onCategorySelect(undefined)}
            className={clsx(
              "flex items-center space-x-3 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors",
              !currentCategory ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"
            )}
          >
            <LayoutDashboard size={20} />
            <span>All Tasks</span>
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Categories
            </h3>
            <button onClick={onAddCategory} className="text-gray-400 hover:text-indigo-600" title="Add category">
              <PlusCircle size={16} />
            </button>
          </div>
          <div className="space-y-1">
            {isLoading ? (
              <p className="px-3 text-sm text-gray-400">Loading...</p>
            ) : (
              categories?.results.map((category) => (
                <button
                  key={category.id}
                  onClick={() => onCategorySelect(category.id)}
                  className={clsx(
                    "flex items-center space-x-3 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    currentCategory === category.id ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <FolderOpen size={20} style={{ color: category.color }} />
                  <span>{category.name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onLogout}
          className="flex items-center space-x-3 w-full px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
