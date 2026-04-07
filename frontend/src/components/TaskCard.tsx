import React, { useState } from 'react';
import { Task } from '../types/tasks';
import { CheckCircle, Circle, Share2, Trash2, Edit2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useTaskShare } from '../api/queries';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onDelete, onEdit }) => {
  const [showShareForm, setShowShareForm] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const { shareTask, isSharing } = useTaskShare();

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

  const priorityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  return (
    <div className={clsx(
      "bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow",
      task.is_completed && "opacity-75"
    )}>
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
              "text-lg font-semibold",
              task.is_completed && "line-through text-gray-500"
            )}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-gray-600 text-sm mt-1">{task.description}</p>
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
                {task.priority}
              </span>
              {task.due_date && (
                <span className="text-xs text-gray-500">
                  Due: {new Date(task.due_date).toLocaleDateString()}
                </span>
              )}
            </div>
            {task.shared_with.length > 0 && (
              <div className="flex -space-x-1 mt-3">
                {task.shared_with.map((u) => (
                  <div key={u.id} className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] text-white border-2 border-white ring-1 ring-gray-100" title={u.email}>
                    {u.name[0]}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex space-x-1">
          <button onClick={() => setShowShareForm(!showShareForm)} className="p-1 text-gray-400 hover:text-indigo-600" title="Share">
            <Share2 size={18} />
          </button>
          <button onClick={() => onEdit(task)} className="p-1 text-gray-400 hover:text-blue-600" title="Edit">
            <Edit2 size={18} />
          </button>
          <button onClick={() => onDelete(task.id)} className="p-1 text-gray-400 hover:text-red-600" title="Delete">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {showShareForm && (
        <form onSubmit={handleShare} className="mt-4 flex space-x-2">
          <input
            type="email"
            placeholder="User's email"
            required
            className="flex-1 px-3 py-1 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
          />
          <button
            type="submit"
            disabled={isSharing}
            className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            Share
          </button>
        </form>
      )}
    </div>
  );
};
