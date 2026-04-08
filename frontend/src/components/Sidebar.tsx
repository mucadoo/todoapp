import React, { useMemo } from 'react';
import { useCategories } from '../api/queries';
import { LayoutDashboard, FolderOpen, LogOut, Settings2, X, Languages, Sun, Moon, CheckCircle2, User, FilterX, Users } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { SidebarItemSkeleton } from './Skeleton';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import { Category } from '../types/tasks';

interface SidebarProps {
  currentCategory?: string;
  onCategorySelect: (id?: string) => void;
  onLogout: () => void;
  onAddCategory: () => void;
  onOpenProfile: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentCategory,
  onCategorySelect,
  onLogout,
  onAddCategory,
  onOpenProfile,
  isOpen,
  onClose,
}) => {
  const { t, i18n } = useTranslation();
  const { categories, isLoading } = useCategories();
  const { isDark, toggleDarkMode } = useTheme();

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith('en') ? 'pt' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const { ownedCategories, sharedCategories } = useMemo(() => {
    if (!categories?.results) return { ownedCategories: [], sharedCategories: [] };
    return {
      ownedCategories: categories.results.filter(c => !c.is_shared),
      sharedCategories: categories.results.filter(c => c.is_shared)
    };
  }, [categories]);

  const sidebarClasses = clsx(
    "fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-full",
    isOpen ? "translate-x-0" : "-translate-x-full"
  );

  const handleCategoryClick = (id?: string) => {
    onCategorySelect(id);
    if (onClose) onClose();
  };

  const renderCategoryItem = (category: Category) => (
    <button
      key={category.id}
      onClick={() => handleCategoryClick(category.id)}
      className={clsx(
        "flex items-center space-x-3 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors group",
        currentCategory === category.id ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
      )}
    >
      <FolderOpen size={20} style={{ color: category.color }} className="opacity-80 group-hover:opacity-100 transition-opacity" />
      <div className="flex flex-col items-start min-w-0">
        <span className="truncate w-full text-left">{category.name}</span>
        {category.is_shared && category.owner && (
          <span className="text-[10px] text-gray-400 truncate w-full text-left -mt-0.5">
            {category.owner.name || category.owner.username}
          </span>
        )}
      </div>
    </button>
  );

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
        <div className="flex items-center justify-between px-6 py-4 shrink-0 h-16 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="text-indigo-600 dark:text-indigo-400" size={24} />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">TodoApp</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 lg:hidden">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          <div className="space-y-1">
            <button
              onClick={() => handleCategoryClick(undefined)}
              className={clsx(
                "flex items-center space-x-3 w-full px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                currentCategory === undefined ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 shadow-sm" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
            >
              <LayoutDashboard size={20} />
              <span>{t('common.allTasks')}</span>
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('categories.title')}
              </h3>
              <button onClick={onAddCategory} className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" title={t('categories.manageCategories')}>
                <Settings2 size={16} />
              </button>
            </div>
            <div className="space-y-1">
              <button
                onClick={() => handleCategoryClick('null')}
                className={clsx(
                  "flex items-center space-x-3 w-full px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  currentCategory === 'null' ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 shadow-sm" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                )}
              >
                <FilterX size={20} />
                <span>{t('tasks.noCategory')}</span>
              </button>
              {isLoading ? (
                <>
                  <SidebarItemSkeleton />
                  <SidebarItemSkeleton />
                </>
              ) : (
                ownedCategories.map(renderCategoryItem)
              )}
            </div>
          </div>

          {sharedCategories.length > 0 && (
            <div>
              <div className="flex items-center px-3 mb-2">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Users size={12} />
                  <span>{t('categories.shared')}</span>
                </h3>
              </div>
              <div className="space-y-1">
                {sharedCategories.map(renderCategoryItem)}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-1 bg-gray-50/50 dark:bg-gray-800/50">
          <button
            onClick={onOpenProfile}
            className="flex items-center space-x-3 w-full px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <User size={20} />
            <span>{t('auth.profile')}</span>
          </button>
          <button
            onClick={toggleLanguage}
            className="flex items-center space-x-3 w-full px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Languages size={20} />
            <span>{i18n.language.startsWith('en') ? 'Português' : 'English'}</span>
          </button>
          <button
            onClick={toggleDarkMode}
            className="flex items-center space-x-3 w-full px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            <span>{isDark ? t('common.lightMode') : t('common.darkMode')}</span>
          </button>
          <div className="pt-1">
            <button
              onClick={onLogout}
              className="flex items-center space-x-3 w-full px-3 py-2 rounded-md text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut size={20} />
              <span>{t('common.logout')}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
