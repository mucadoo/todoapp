import React from 'react';
import { useCategories } from '../api/queries';
import { LayoutDashboard, FolderOpen, LogOut, PlusCircle, X, Languages, Sun, Moon } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';
import { SidebarItemSkeleton } from './Skeleton';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';

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
  const { t, i18n } = useTranslation();
  const { categories, isLoading } = useCategories();
  const { isDark, toggleDarkMode } = useDarkMode();

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith('en') ? 'pt' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const sidebarClasses = clsx(
    "fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:pt-16",
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
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Menu</h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          <div>
            <button
              onClick={() => handleCategoryClick(undefined)}
              className={clsx(
                "flex items-center space-x-3 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors",
                !currentCategory ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
            >
              <LayoutDashboard size={20} />
              <span>{t('tasks.title')}</span>
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('categories.title')}
              </h3>
              <button onClick={onAddCategory} className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400" title={t('categories.newCategory')}>
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
                      currentCategory === category.id ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
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

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <button
            onClick={toggleLanguage}
            className="flex items-center space-x-3 w-full px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Languages size={20} />
            <span>{i18n.language.startsWith('en') ? 'Português' : 'English'}</span>
          </button>
          <button
            onClick={toggleDarkMode}
            className="flex items-center space-x-3 w-full px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            <span>{isDark ? t('common.lightMode') : t('common.darkMode')}</span>
          </button>
          <button
            onClick={onLogout}
            className="flex items-center space-x-3 w-full px-3 py-2 rounded-md text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut size={20} />
            <span>{t('common.logout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
