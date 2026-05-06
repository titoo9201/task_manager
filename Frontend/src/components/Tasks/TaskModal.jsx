import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../UI/Button';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const TaskModal = ({ isOpen, onClose, onSave, task, projectId }) => {
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
    project: projectId || '',
    assignedTo: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
      if (task) {
        setFormData({
          title: task.title || '',
          description: task.description || '',
          status: task.status || 'todo',
          priority: task.priority || 'medium',
          dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
          project: task.project?._id || task.project || projectId || '',
          assignedTo: task.assignedTo?._id || task.assignedTo || '',
        });
      } else {
        setFormData({
          title: '',
          description: '',
          status: 'todo',
          priority: 'medium',
          dueDate: '',
          project: projectId || '',
          assignedTo: '',
        });
      }
    }
  }, [isOpen, task, projectId]);

  useEffect(() => {
    if (formData.project) fetchMembers(formData.project);
  }, [formData.project]);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data.data.projects);
    } catch (error) {
      console.error('Failed to fetch projects');
    }
  };

  const fetchMembers = async (pid) => {
    try {
      const { data } = await api.get(`/projects/${pid}`);
      const proj = data.data.project;
      const allMembers = [proj.owner, ...proj.members.filter(
        (m) => m._id !== proj.owner._id
      )];
      setMembers(allMembers);
    } catch (error) {
      setMembers([]);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error('Title is required');
    if (!formData.project) return toast.error('Please select a project');
    if (!formData.dueDate) return toast.error('Due date is required');

    setLoading(true);
    try {
      let response;
      if (task) {
        response = await api.put(`/tasks/${task._id}`, formData);
        toast.success('Task updated successfully');
      } else {
        response = await api.post('/tasks', formData);
        toast.success('Task created successfully');
      }
      onSave(response.data.data.task);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter task title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-field resize-none"
              rows={3}
              placeholder="Enter task description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project *
              </label>
              <select
                name="project"
                value={formData.project}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="">Select project</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign To
              </label>
              <select
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="input-field"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input-field"
              >
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date *
            </label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={loading}>
              {task ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;