import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios.ts';
import { useNavigate } from 'react-router-dom';

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/tasks');
        setTasks(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <div>
          <span className="mr-4">Hello, {user?.username}</span>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      {loading && <p>Loading tasks...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.length === 0 && <p>No tasks found.</p>}
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white p-4 rounded shadow flex justify-between items-center"
            >
              <span className={task.completed ? 'line-through text-gray-400' : ''}>
                {task.title}
              </span>
              <span>
                {task.completed ? (
                  <span className="text-green-500 font-semibold">Done</span>
                ) : (
                  <span className="text-yellow-500 font-semibold">Pending</span>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;