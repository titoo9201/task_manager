import { useState, useEffect } from 'react';
import { CheckSquare, Clock, AlertCircle, BarChart3, TrendingUp } from 'lucide-react';
import { format, isPast } from 'date-fns';
import StatsCard from '../components/UI/StatsCard';
import Badge from '../components/UI/Badge';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, tasksRes, projectsRes] = await Promise.all([
        api.get('/tasks/stats'),
        api.get('/tasks?limit=5'),
        api.get('/projects'),
      ]);

      setStats(statsRes.data.data.stats);
      setRecentTasks(tasksRes.data.data.tasks.slice(0, 6));
      setProjects(projectsRes.data.data.projects.slice(0, 4));
    } catch (error) {
      console.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const completionRate = stats?.total
    ? Math.round((stats.done / stats.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Here's what's happening with your projects today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Tasks"
          value={stats?.total || 0}
          icon={BarChart3}
          color="indigo"
          subtitle="All assigned tasks"
        />
        <StatsCard
          title="Completed"
          value={stats?.done || 0}
          icon={CheckSquare}
          color="green"
          subtitle={`${completionRate}% completion rate`}
        />
        <StatsCard
          title="In Progress"
          value={stats?.inProgress || 0}
          icon={Clock}
          color="blue"
          subtitle="Currently active"
        />
        <StatsCard
          title="Overdue"
          value={stats?.overdue || 0}
          icon={AlertCircle}
          color="red"
          subtitle="Need attention"
        />
      </div>

      {/* Progress Bar */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-600" />
            <h3 className="font-semibold text-gray-900">Overall Progress</h3>
          </div>
          <span className="text-2xl font-bold text-indigo-600">{completionRate}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>{stats?.done || 0} completed</span>
          <span>{(stats?.total || 0) - (stats?.done || 0)} remaining</span>
        </div>
      </div>

      {/* Recent Tasks & Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Tasks</h3>
          <div className="space-y-3">
            {recentTasks.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No tasks found</p>
            ) : (
              recentTasks.map((task) => {
                const overdue =
                  task.status !== 'done' &&
                  task.dueDate &&
                  isPast(new Date(task.dueDate));
                return (
                  <div
                    key={task._id}
                    className={`flex items-center justify-between p-3 rounded-xl 
                    ${overdue ? 'bg-red-50 border border-red-100' : 'bg-gray-50'}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {task.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {task.project?.name} •{' '}
                        {task.dueDate
                          ? format(new Date(task.dueDate), 'MMM dd')
                          : 'No date'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      {overdue && <AlertCircle size={14} className="text-red-500" />}
                      <Badge variant={task.status} size="sm">
                        {task.status.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Projects Summary */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Active Projects</h3>
          <div className="space-y-3">
            {projects.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No projects found</p>
            ) : (
              projects.map((project) => (
                <div
                  key={project._id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
                    style={{ backgroundColor: project.color }}
                  >
                    {project.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {project.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {project.members?.length || 0} members
                    </p>
                  </div>
                  <Badge variant={project.status} size="sm">
                    {project.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;