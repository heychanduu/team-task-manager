import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboard()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (!stats) return <div className="loading">Failed to load dashboard.</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <Link to="/projects" className="btn btn-primary">View Projects</Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-number">{stats.totalProjects}</span>
          <span className="stat-label">Projects</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{stats.totalTasks}</span>
          <span className="stat-label">Total Tasks</span>
        </div>
        <div className="stat-card accent-blue">
          <span className="stat-number">{stats.todoTasks}</span>
          <span className="stat-label">To Do</span>
        </div>
        <div className="stat-card accent-yellow">
          <span className="stat-number">{stats.inProgressTasks}</span>
          <span className="stat-label">In Progress</span>
        </div>
        <div className="stat-card accent-green">
          <span className="stat-number">{stats.doneTasks}</span>
          <span className="stat-label">Done</span>
        </div>
        <div className="stat-card accent-red">
          <span className="stat-number">{stats.overdueTasks}</span>
          <span className="stat-label">Overdue</span>
        </div>
      </div>

      {Object.keys(stats.tasksPerUser).length > 0 && (
        <div className="section">
          <h2>Tasks Per User</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Tasks</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(stats.tasksPerUser).map(([name, count]) => (
                  <tr key={name}>
                    <td>{name}</td>
                    <td>{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
