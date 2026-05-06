import { useState, useEffect, useCallback } from 'react';
import { Plus, Filter, RefreshCw, Search } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/Tasks/TaskCard';
import TaskModal from '../components/Tasks/TaskModal';
import Button from '../components/UI/Button';
import toast from 'react-hot-toast';

const COLUMNS = [
  { id: 'todo', label: 'To Do', color: 'bg-gray-200', dot: 'bg-gray-400' },
  { id: 'in-progress', label: 'In Progress', color: 'bg-blue-100', dot: 'bg-blue-500' },
  { id: 'done', label: 'Done', color: 'bg-green-100', dot: 'bg-green-500' },
];

const TaskBoard = () => {
  const { isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filters, setFilters] = useState({ priority: '', search: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.search) params.append('search', filters.search);

      const { data } = await api.get(`/tasks?${params}`);
      setTasks(data.data.tasks);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const { data } = await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? data.data.task : t))
      );
      toast.success('Task status updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleSaveTask = (savedTask) => {
    setTasks((prev) => {
      const exists = prev.find((t) => t._id === savedTask._id);
      if (exists) {
        return prev.map((t) => (t._id === savedTask._id ? savedTask : t));
      }
      return [savedTask, ...prev];
    });
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTask(null);
  };

  const getColumnTasks = (status) => {
    return tasks.filter((t) => t.status === status);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Board</h1>
          <p className="text-gray-500 mt-1">{tasks.length} total tasks</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className={`p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors ${
              refreshing ? 'animate-spin' : ''
            }`}
          >
            <RefreshCw size={18} className="text-gray-600" />
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg border transition-colors ${
              showFilters
                ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                : 'border-gray-200 hover:bg-gray-50 text-gray-600'
            }`}
          >
            <Filter size={18} />
          </button>
          {isAdmin && (
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setShowModal(true)}
            >
              Add Task
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card animate-slide-up">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search tasks..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="input-field pl-9 py-2"
              />
            </div>
            <select
              value={filters.priority}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, priority: e.target.value }))
              }
              className="input-field py-2 w-40"
            >
              <option value="">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setFilters({ priority: '', search: '' })}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLUMNS.map((column) => {
            const columnTasks = getColumnTasks(column.id);
            return (
              <div key={column.id} className="flex flex-col gap-3">
                {/* Column Header */}
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${column.dot}`} />
                  <h2 className="font-semibold text-gray-700">{column.label}</h2>
                  <span className="ml-auto bg-gray-200 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Column Drop Zone */}
                <div className={`min-h-[200px] rounded-2xl p-3 ${column.color} space-y-3`}>
                  {columnTasks.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-sm text-gray-400">
                      No tasks here
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        onEdit={handleEditTask}
                        onDelete={handleDeleteTask}
                        onStatusChange={handleStatusChange}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSave={handleSaveTask}
        task={editingTask}
      />
    </div>
  );
};

export default TaskBoard;