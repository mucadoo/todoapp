import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Search, UserPlus, UserMinus } from 'lucide-react';
import { Task } from '../types/tasks';
import { User } from '../types/auth';
import { useAuth, useTaskShare } from '../api/queries';
import { useDebounce } from '../utils/hooks';

interface ShareTaskModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareTaskModal: React.FC<ShareTaskModalProps> = ({ task, isOpen, onClose }) => {
  const { t } = useTranslation();
  const { searchUsersQuery } = useAuth();
  const { shareTask, unshareTask, isSharing, isUnsharing } = useTaskShare();

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const { data: searchResults, isLoading: isSearchingUsers } = searchUsersQuery(debouncedSearchQuery);

  const [sharedUsers, setSharedUsers] = useState<User[]>(task.shared_with || []);

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSharedUsers(task.shared_with || []);
  }, [task.shared_with]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleShareUser = async (userToShare: User) => {
    try {
      await shareTask({ id: task.id, email: userToShare.email });
      setSharedUsers((prev) => [...prev, userToShare]);
    } catch (error) {
      console.error('Failed to share task:', error);
    }
  };

  const handleUnshareUser = async (userToUnshare: User) => {
    try {
      await unshareTask({ id: task.id, email: userToUnshare.email });
      setSharedUsers((prev) => prev.filter((u) => u.id !== userToUnshare.id));
    } catch (error) {
      console.error('Failed to unshare task:', error);
    }
  };

  const isUserShared = (user: User) => sharedUsers.some((u) => u.id === user.id);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div ref={modalRef} className="relative p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('tasks.shareTask')}</h3>
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        <div className="mb-4">
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{t('tasks.currentlySharedWith')}:</p>
          {sharedUsers.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('tasks.notSharedYet')}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {sharedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center bg-indigo-100 dark:bg-indigo-700 text-indigo-800 dark:text-indigo-100 text-xs font-medium px-2.5 py-0.5 rounded-full"
                >
                  {user.name || user.username || user.email}
                  <button
                    onClick={() => handleUnshareUser(user)}
                    disabled={isUnsharing}
                    className="ml-1 text-indigo-600 dark:text-indigo-200 hover:text-indigo-800 dark:hover:text-indigo-50 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="user-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('tasks.searchUsers')}
          </label>
          <div className="relative">
            <input
              id="user-search"
              type="text"
              placeholder={t('tasks.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
          </div>
        </div>

        {debouncedSearchQuery && (
          <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md mb-4">
            {isSearchingUsers ? (
              <p className="p-3 text-sm text-gray-500 dark:text-gray-400">{t('common.loading')}...</p>
            ) : searchResults && searchResults.length > 0 ? (
              <ul>
                {searchResults.map((user) => (
                  <li
                    key={user.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                  >
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs mr-2">
                        {user.name ? user.name[0] : (user.username ? user.username[0] : user.email[0])}
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white">{user.name || user.username || user.email}</span>
                    </div>
                    {isUserShared(user) ? (
                      <button
                        onClick={() => handleUnshareUser(user)}
                        disabled={isUnsharing}
                        className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                        title={t('tasks.unshare')}
                      >
                        <UserMinus size={18} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleShareUser(user)}
                        disabled={isSharing}
                        className="p-1 text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-400 transition-colors"
                        title={t('tasks.share')}
                      >
                        <UserPlus size={18} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-3 text-sm text-gray-500 dark:text-gray-400">{t('tasks.noUsersFound')}</p>
            )}
          </div>
        )}

        <div className="flex justify-end mt-4">
          <button
            type="button"
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            onClick={onClose}
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
