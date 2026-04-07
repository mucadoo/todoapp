import React from 'react';
import { useCategories } from '../api/queries';
import { LayoutDashboard, FolderOpen, LogOut, PlusCircle, X } from 'lucide-react';
import { SidebarItemSkeleton } from './Skeleton';
import { clsx } from 'clsx';

interface SidebarProps {
  currentCategory?: string;
  onCategorySelect: (id?: string) => void;
  onLogout: () => void;
  onAddCategory: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentCategory,
  onCategorySelect,
  onLogout,
  onAddCategory,
  isOpen,
  onClose,
}) => {
  const { categories, isLoading } = useCategories();

  const sidebarClasses = clsx(
    "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:pt-16",
    isOpen ? "translate-x-0" : "-translate-x-full"
  );

  const handleCategoryClick = (id?: string) => {
    onCategorySelect(id);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-30 lg:hidden" 
          onClick={onClose}
        />
      )}

      <aside className={sidebarClasses}>
        <div className="flex items-center justify-between px-4 py-4 lg:hidden">
          <h2 className="text-xl font-bold text-gray-900">Menu</h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          <div>
            <button
              onClick={() => handleCategoryClick(undefined)}
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
                <>
                  <SidebarItemSkeleton />
                  <SidebarItemSkeleton />
                  <SidebarItemSkeleton />
                </>
              ) : (
                categories?.results.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
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
    </>
  );
};
