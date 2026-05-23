import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const fetchProjects = () => {
    api.getProjects()
      .then((data) => setProjects(data.projects))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(fetchProjects, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.createProject({ name, description });
      setName('');
      setDescription('');
      setShowForm(false);
      fetchProjects();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading projects...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Projects</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Project'}
        </button>
      </div>

      {showForm && (
        <div className="card form-card">
          <h3>Create Project</h3>
          {error && <div className="error-msg">{error}</div>}
          <form onSubmit={handleCreate}>
            <label htmlFor="project-name">Name</label>
            <input
              id="project-name"
              type="text"
              placeholder="Project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <label htmlFor="project-desc">Description (optional)</label>
            <textarea
              id="project-desc"
              placeholder="Brief description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
            <button type="submit" className="btn btn-primary">Create</button>
          </form>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="empty-state">
          <p>No projects yet. Create your first project to get started.</p>
        </div>
      ) : (
        <div className="project-grid">
          {projects.map((p) => (
            <Link to={`/projects/${p._id}`} key={p._id} className="project-card">
              <h3>{p.name}</h3>
              {p.description && <p className="project-desc">{p.description}</p>}
              <div className="project-meta">
                <span>Admin: {p.admin.name}</span>
                <span>{p.members.length} member{p.members.length !== 1 ? 's' : ''}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
