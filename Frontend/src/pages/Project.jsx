import { useState, useEffect } from 'react';
import { Plus, Search, X, UserPlus, UserMinus } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ProjectCard from '../components/Projects/ProjectCard';
import Button from '../components/UI/Button';
import toast from 'react-hot-toast';

const PROJECT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#22c55e', '#06b6d4',
];

const defaultForm = {
  name: '', description: '', status: 'active',
  priority: 'medium', color: '#6366f1', dueDate: '',
};

const Projects = () => {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [formData, setFormData] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProjects();
    if (isAdmin) fetchUsers();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/projects');
      setProjects(data.data.projects);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/api/auth/users');
      setUsers(data.data.users);
    } catch (error) {
      console.error('Failed to load users');
    }
  };

  const handleOpenModal = (project = null) => {
    setEditingProject(project);
    setFormData(
      project
        ? {
            name: project.name,
            description: project.description || '',
            status: project.status,
            priority: project.priority,
            color: project.color,
            dueDate: project.dueDate ? project.dueDate.split('T')[0] : '',
          }
        : defaultForm
    );
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error('Project name is required');

    setSaving(true);
    try {
      if (editingProject) {
        const { data } = await api.put(`/api/projects/${editingProject._id}`, formData);
        setProjects((prev) =>
          prev.map((p) => (p._id === editingProject._id ? data.data.project : p))
        );
        toast.success('Project updated!');
      } else {
        const { data } = await api.post('/api/projects', formData);
        setProjects((prev) => [data.data.project, ...prev]);
        toast.success('Project created!');
      }
      setShowModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Delete this project? All tasks will be removed.')) return;
    try {
      await api.delete(`/api/projects/${projectId}`);
      setProjects((prev) => prev.filter((p) => p._id !== projectId));
      toast.success('Project deleted');
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const handleManageMembers = (project) => {
    setSelectedProject(project);
    setShowMembersModal(true);
  };

  const handleAddMember = async (userId) => {
    try {
      const { data } = await api.post(`/api/projects/${selectedProject._id}/members`, {
        userId,
      });
      const updated = data.data.project;
      setProjects((prev) =>
        prev.map((p) => (p._id === updated._id ? updated : p))
      );
      setSelectedProject(updated);
      toast.success('Member added');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      const { data } = await api.delete(
        `/api/projects/${selectedProject._id}/members/${userId}`
      );
      const updated = data.data.project;
      setProjects((prev) =>
        prev.map((p) => (p._id === updated._id ? updated : p))
      );
      setSelectedProject(updated);
      toast.success('Member removed');
    } catch (error) {
      toast.error('Failed to remove member');
    }
  };

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const nonMembers = users.filter(
    (u) => !selectedProject?.members?.some((m) => m._id === u._id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 mt-1">{filtered.length} projects found</p>
        </div>
        {isAdmin && (
          <Button variant="primary" icon={Plus} onClick={() => handleOpenModal()}>
            New Project
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects..."
          className="input-field pl-9"
        />
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400">No projects found</p>
          {isAdmin && (
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => handleOpenModal()}
            >
              Create your first project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onEdit={handleOpenModal}
              onDelete={handleDelete}
              onManageMembers={handleManageMembers}
            />
          ))}
        </div>
      )}

      {/* Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingProject ? 'Edit Project' : 'Create Project'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name *
                </label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  className="input-field"
                  placeholder="My awesome project"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, description: e.target.value }))
                  }
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Describe the project..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, status: e.target.value }))
                    }
                    className="input-field"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, priority: e.target.value }))
                    }
                    className="input-field"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex gap-2">
                  {PROJECT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, color: c }))}
                      className={`w-7 h-7 rounded-lg transition-transform ${
                        formData.color === c ? 'scale-125 ring-2 ring-offset-2 ring-gray-400' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, dueDate: e.target.value }))
                  }
                  className="input-field"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" onClick={() => setShowModal(false)} type="button">
                  Cancel
                </Button>
                <Button variant="primary" type="submit" loading={saving}>
                  {editingProject ? 'Save Changes' : 'Create Project'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Members Modal */}
      {showMembersModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Manage Members</h2>
                <p className="text-sm text-gray-500">{selectedProject.name}</p>
              </div>
              <button
                onClick={() => setShowMembersModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-4">
              {/* Current Members */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Current Members ({selectedProject.members?.length || 0})
                </h3>
                <div className="space-y-2">
                  {selectedProject.members?.length === 0 ? (
                    <p className="text-sm text-gray-400">No members yet</p>
                  ) : (
                    selectedProject.members?.map((member) => (
                      <div
                        key={member._id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-7 h-7 rounded-full"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{member.name}</p>
                            <p className="text-xs text-gray-400">{member.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveMember(member._id)}
                          className="p-1 rounded hover:bg-red-100 text-red-500"
                          title="Remove member"
                        >
                          <UserMinus size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Add Members */}
              {nonMembers.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Add Members
                  </h3>
                  <div className="space-y-2">
                    {nonMembers.map((user) => (
                      <div
                        key={user._id}
                        className="flex items-center justify-between p-2 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-7 h-7 rounded-full"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddMember(user._id)}
                          className="p-1 rounded hover:bg-green-100 text-green-600"
                          title="Add member"
                        >
                          <UserPlus size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;