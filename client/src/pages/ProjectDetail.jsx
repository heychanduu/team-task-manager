import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Task form
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskAssignedTo, setTaskAssignedTo] = useState('');

  // Member form
  const [memberEmail, setMemberEmail] = useState('');

  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [projData, taskData] = await Promise.all([
        api.getProject(id),
        api.getTasks(id),
      ]);
      setProject(projData.project);
      setIsAdmin(projData.isAdmin);
      setTasks(taskData.tasks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.createTask(id, {
        title: taskTitle,
        description: taskDesc,
        priority: taskPriority,
        dueDate: taskDueDate || null,
        assignedTo: taskAssignedTo || null,
      });
      setTaskTitle('');
      setTaskDesc('');
      setTaskPriority('medium');
      setTaskDueDate('');
      setTaskAssignedTo('');
      setShowTaskForm(false);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.updateTask(taskId, { status: newStatus });
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.deleteTask(taskId);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.addMember(id, memberEmail);
      setMemberEmail('');
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member?')) return;
    try {
      await api.removeMember(id, userId);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm('Delete this project and all its tasks?')) return;
    try {
      await api.deleteProject(id);
      navigate('/projects');
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="loading">Loading project...</div>;
  if (!project) return <div className="loading">Project not found.</div>;

  const columns = [
    { key: 'todo', label: 'To Do' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'done', label: 'Done' },
  ];

  // All assignable users (admin + members)
  const allUsers = [
    { _id: project.admin._id, name: project.admin.name, email: project.admin.email },
    ...project.members,
  ];

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString();
  };

  const isOverdue = (task) => {
    return task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{project.name}</h1>
          {project.description && <p className="project-desc">{project.description}</p>}
        </div>
        <div className="header-actions">
          {isAdmin && (
            <>
              <button className="btn btn-primary" onClick={() => setShowTaskForm(!showTaskForm)}>
                {showTaskForm ? 'Cancel' : '+ Add Task'}
              </button>
              <button className="btn btn-danger" onClick={handleDeleteProject}>
                Delete Project
              </button>
            </>
          )}
        </div>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {/* Members Section */}
      <div className="section">
        <h2>Team</h2>
        <div className="members-list">
          <div className="member-tag">
            {project.admin.name} <span className="badge">Admin</span>
          </div>
          {project.members.map((m) => (
            <div className="member-tag" key={m._id}>
              {m.name}
              {isAdmin && (
                <button
                  className="btn-icon"
                  onClick={() => handleRemoveMember(m._id)}
                  title="Remove member"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        {isAdmin && (
          <form onSubmit={handleAddMember} className="inline-form">
            <input
              type="email"
              placeholder="Add member by email"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-small">Add</button>
          </form>
        )}
      </div>

      {/* Create Task Form */}
      {showTaskForm && (
        <div className="card form-card">
          <h3>New Task</h3>
          <form onSubmit={handleCreateTask}>
            <label htmlFor="task-title">Title</label>
            <input
              id="task-title"
              type="text"
              placeholder="Task title"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              required
            />
            <label htmlFor="task-description">Description</label>
            <textarea
              id="task-description"
              placeholder="Task description"
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
              rows={2}
            />
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="task-priority">Priority</label>
                <select
                  id="task-priority"
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="task-duedate">Due Date</label>
                <input
                  id="task-duedate"
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="task-assign">Assign To</label>
                <select
                  id="task-assign"
                  value={taskAssignedTo}
                  onChange={(e) => setTaskAssignedTo(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {allUsers.map((u) => (
                    <option key={u._id} value={u._id}>{u.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Create Task</button>
          </form>
        </div>
      )}

      {/* Task Board */}
      <div className="task-board">
        {columns.map((col) => (
          <div className="task-column" key={col.key}>
            <h3 className={`column-header ${col.key}`}>{col.label}</h3>
            <div className="task-list">
              {tasks
                .filter((t) => t.status === col.key)
                .map((task) => (
                  <div className={`task-card ${isOverdue(task) ? 'overdue' : ''}`} key={task._id}>
                    <div className="task-top">
                      <span className={`priority-dot ${task.priority}`} title={task.priority} />
                      <span className="task-title">{task.title}</span>
                    </div>
                    {task.description && (
                      <p className="task-desc">{task.description}</p>
                    )}
                    <div className="task-meta">
                      {task.assignedTo && (
                        <span className="task-assignee">{task.assignedTo.name}</span>
                      )}
                      {task.dueDate && (
                        <span className={`task-due ${isOverdue(task) ? 'text-red' : ''}`}>
                          Due: {formatDate(task.dueDate)}
                        </span>
                      )}
                    </div>
                    <div className="task-actions">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        className="status-select"
                      >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                      {isAdmin && (
                        <button
                          className="btn-icon text-red"
                          onClick={() => handleDeleteTask(task._id)}
                          title="Delete task"
                        >
                          🗑
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              {tasks.filter((t) => t.status === col.key).length === 0 && (
                <p className="empty-col">No tasks</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
