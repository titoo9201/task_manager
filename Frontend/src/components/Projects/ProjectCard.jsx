import { Users, Calendar, MoreVertical, Edit, Trash2, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import Badge from '../UI/Badge';
import { useAuth } from '../../context/AuthContext';

const ProjectCard = ({ project, onEdit, onDelete, onManageMembers }) => {
  const { isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="card hover:shadow-md transition-all duration-200 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: project.color }}
          >
            {project.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{project.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant={project.status} size="sm">{project.status}</Badge>
              <Badge variant={project.priority} size="sm">{project.priority}</Badge>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <MoreVertical size={16} className="text-gray-400" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 min-w-[160px]">
                  <button
                    onClick={() => { onEdit(project); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Edit size={14} /> Edit Project
                  </button>
                  <button
                    onClick={() => { onManageMembers(project); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <UserPlus size={14} /> Manage Members
                  </button>
                  <hr className="my-1 border-gray-100" />
                  <button
                    onClick={() => { onDelete(project._id); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{project.description}</p>
      )}

      {/* Members */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {project.members?.slice(0, 4).map((member) => (
              <img
                key={member._id}
                src={member.avatar}
                alt={member.name}
                className="w-7 h-7 rounded-full border-2 border-white"
                title={member.name}
              />
            ))}
            {project.members?.length > 4 && (
              <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-600">+{project.members.length - 4}</span>
              </div>
            )}
          </div>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Users size={12} />
            {project.members?.length || 0} members
          </span>
        </div>

        {project.dueDate && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Calendar size={12} />
            {format(new Date(project.dueDate), 'MMM dd')}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;