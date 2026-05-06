import { format, isPast, parseISO } from 'date-fns';
import { Calendar, User, AlertCircle, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Badge from '../UI/Badge';
import { useAuth } from '../../context/AuthContext';

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const { isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const isOverdue =
    task.status !== 'done' &&
    task.dueDate &&
    isPast(new Date(task.dueDate));

  const statusOptions = ['todo', 'in-progress', 'done'];

  return (
    <div
      className={`card hover:shadow-md transition-all duration-200 animate-slide-up
        ${isOverdue ? 'border-red-200 bg-red-50/30' : ''}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
            {task.title}
          </h3>
          <div
            className="w-2 h-2 rounded-full mt-1.5 inline-block mr-2"
            style={{ backgroundColor: task.project?.color || '#6366f1' }}
          />
          <span className="text-xs text-gray-500">{task.project?.name}</span>
        </div>

        <div className="relative">
          {(isAdmin || task.assignedTo) && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
            >
              <MoreVertical size={16} className="text-gray-400" />
            </button>
          )}

          {menuOpen && (
            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 min-w-[140px]">
              {isAdmin && (
                <>
                  <button
                    onClick={() => { onEdit(task); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Edit size={14} /> Edit Task
                  </button>
                  <button
                    onClick={() => { onDelete(task._id); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* Badges */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <Badge variant={task.priority}>{task.priority}</Badge>
        {isOverdue && (
          <Badge variant="overdue">
            <AlertCircle size={10} className="mr-1" /> Overdue
          </Badge>
        )}
      </div>

      {/* Status Select */}
      <select
        value={task.status}
        onChange={(e) => onStatusChange(task._id, e.target.value)}
        className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 mb-3 
                   bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
      >
        {statusOptions.map((s) => (
          <option key={s} value={s}>
            {s.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </option>
        ))}
      </select>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
          <Calendar size={12} />
          <span>
            {task.dueDate
              ? format(new Date(task.dueDate), 'MMM dd, yyyy')
              : 'No due date'}
          </span>
        </div>

        {task.assignedTo && (
          <div className="flex items-center gap-1">
            <img
              src={task.assignedTo.avatar}
              alt={task.assignedTo.name}
              className="w-6 h-6 rounded-full"
              title={task.assignedTo.name}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;