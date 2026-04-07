import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Task } from '../types/tasks';
import { CheckCircle, Circle, Share2, Trash2, Edit2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../api/queries';
import { formatDate, isTaskOverdue } from '../utils/dateUtils';
import { ShareTaskModal } from './ShareTaskModal';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onDelete, onEdit }) => {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const isOwner = currentUser?.id === task.owner.id;
  const isOverdue = isTaskOverdue(task.due_date, task.has_time, task.is_completed);

  const priorityColors = {
    low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };

  return (
    <div className={clsx(
      "bg-white dark:bg-gray-800 border rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 relative",
      task.is_completed ? "opacity-75 border-gray-200 dark:border-gray-700" : (isOverdue ? "border-red-300 dark:border-red-900/50" : "border-gray-200 dark:border-gray-700")
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 w-full min-w-0">
          <button
            onClick={() => isOwner && onToggle(task.id)}
            disabled={!isOwner}
            className={clsx(
              "mt-1 focus:outline-none shrink-0",
              !isOwner && "cursor-default",
              task.is_completed ? "text-green-500" : "text-gray-400"
            )}
          >
            {task.is_completed ? <CheckCircle size={20} /> : <Circle size={20} />}
          </button>
          <div className="min-w-0 flex-1">
            <h3 className={clsx(
              "text-lg font-semibold dark:text-white truncate",
              task.is_completed && "line-through text-gray-500 dark:text-gray-400"
            )}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-1 line-clamp-2">{task.description}</p>
            )}
            <div className="flex items-center space-x-2 mt-3 flex-wrap gap-y-1">
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
                <span className={clsx(
                  "text-xs font-medium",
                  isOverdue ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-gray-400"
                )}>
                  {t('tasks.dueDate')}: {formatDate(task.due_date, task.has_time)}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1 shrink-0 ml-2">
          {isOwner ? (
            <>
              <button 
                onClick={() => setIsShareModalOpen(true)} 
                className="p-1 transition-colors text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                title={t('tasks.share')}
              >
                <Share2 size={18} />
              </button>
              <button onClick={() => onEdit(task)} className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400" title={t('common.edit')}>
                <Edit2 size={18} />
              </button>
              <button onClick={() => onDelete(task.id)} className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400" title={t('common.delete')}>
                <Trash2 size={18} />
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-1 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded text-[10px] font-bold uppercase tracking-wider">
              <span>{task.owner.name || task.owner.username}</span>
            </div>
          )}
        </div>
      </div>

      <ShareTaskModal
        task={task}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
};
