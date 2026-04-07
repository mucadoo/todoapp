import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Task } from '../types/tasks';
import { CheckCircle, Circle, Share2, Trash2, Edit2, XCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { useTaskShare, useAuth } from '../api/queries';
import { formatDate } from '../utils/dateUtils';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onDelete, onEdit }) => {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const [showShareForm, setShowShareForm] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const { shareTask, unshareTask, isSharing, isUnsharing } = useTaskShare();

  const isOwner = currentUser?.id === task.owner.id;

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await shareTask({ id: task.id, email: shareEmail });
      setShowShareForm(false);
      setShareEmail('');
    } catch (error) {
      console.error('Sharing failed:', error);
    }
  };

  const handleUnshare = async (email: string) => {
    try {
      await unshareTask({ id: task.id, email });
    } catch (error) {
      console.error('Unsharing failed:', error);
    }
  };

  const priorityColors = {
    low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };

  return (
    <div className={clsx(
      "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 relative",
      task.is_completed && "opacity-75"
    )}>
      {!isOwner && (
        <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm z-10 uppercase tracking-wider">
          {t('tasks.shared')}
        </div>
      )}

      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <button
            onClick={() => onToggle(task.id)}
            className={clsx(
              "mt-1 focus:outline-none",
              task.is_completed ? "text-green-500" : "text-gray-400"
            )}
          >
            {task.is_completed ? <CheckCircle size={20} /> : <Circle size={20} />}
          </button>
          <div>
            <h3 className={clsx(
              "text-lg font-semibold dark:text-white",
              task.is_completed && "line-through text-gray-500 dark:text-gray-400"
            )}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{task.description}</p>
            )}
            <div className="flex items-center space-x-2 mt-3 flex-wrap">
              {task.category && (
                <span
                  className="px-2 py-0.5 rounded text-xs font-medium"
                  style={{ backgroundColor: task.category.color + '20', color: task.category.color }}
                >
                  {task.category.name}
                </span>
              )}
              <span className={clsx("px-2 py-0.5 rounded text-xs font-medium uppercase", priorityColors[task.priority])}>
                {t(`tasks.${task.priority}`)}
              </span>
              {task.due_date && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {t('tasks.dueDate')}: {formatDate(task.due_date, { dateStyle: 'short' })}
                </span>
              )}
            </div>
            
            {task.shared_with.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-3">
                {task.shared_with.map((u) => (
                  <div 
                    key={u.id} 
                    className="group flex items-center bg-gray-100 dark:bg-gray-700 rounded-full pl-1 pr-1.5 py-0.5 text-[10px] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                  >
                    <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-white mr-1">
                      {u.name[0]}
                    </div>
                    <span className="max-w-[80px] truncate" title={u.email}>{u.name}</span>
                    {isOwner && (
                      <button 
                        onClick={() => handleUnshare(u.email)}
                        disabled={isUnsharing}
                        className="ml-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <XCircle size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex space-x-1">
          {isOwner && (
            <button 
              onClick={() => setShowShareForm(!showShareForm)} 
              className={clsx(
                "p-1 transition-colors",
                showShareForm ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400"
              )}
              title={t('tasks.share')}
            >
              <Share2 size={18} />
            </button>
          )}
          <button onClick={() => onEdit(task)} className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400" title={t('common.edit')}>
            <Edit2 size={18} />
          </button>
          <button onClick={() => onDelete(task.id)} className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400" title={t('common.delete')}>
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {showShareForm && isOwner && (
        <form onSubmit={handleShare} className="mt-4 flex space-x-2">
          <input
            type="email"
            placeholder={t('auth.email')}
            required
            className="flex-1 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
          />
          <button
            type="submit"
            disabled={isSharing}
            className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 min-w-[70px]"
          >
            {isSharing ? '...' : t('tasks.share')}
          </button>
        </form>
      )}
    </div>
  );
};
