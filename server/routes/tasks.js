const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

const router = express.Router();

// Helper: check if user has access to project
const getProjectAccess = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) return { project: null, isAdmin: false, isMember: false };

  const isAdmin = project.admin.toString() === userId.toString();
  const isMember = project.members.some(
    (m) => m.toString() === userId.toString()
  );

  return { project, isAdmin, isMember };
};

// GET /api/projects/:projectId/tasks – list tasks in project
router.get('/projects/:projectId/tasks', auth, async (req, res) => {
  try {
    const { project, isAdmin, isMember } = await getProjectAccess(
      req.params.projectId,
      req.user._id
    );

    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!isAdmin && !isMember) return res.status(403).json({ message: 'Access denied' });

    let tasks;
    if (isAdmin) {
      tasks = await Task.find({ project: project._id })
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });
    } else {
      // Members see only their assigned tasks
      tasks = await Task.find({ project: project._id, assignedTo: req.user._id })
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });
    }

    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/projects/:projectId/tasks – create task (admin only)
router.post('/projects/:projectId/tasks', auth, async (req, res) => {
  try {
    const { project, isAdmin } = await getProjectAccess(
      req.params.projectId,
      req.user._id
    );

    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!isAdmin) return res.status(403).json({ message: 'Only admin can create tasks' });

    const { title, description, assignedTo, priority, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    const task = await Task.create({
      title,
      description: description || '',
      project: project._id,
      assignedTo: assignedTo || null,
      priority: priority || 'medium',
      dueDate: dueDate || null,
      createdBy: req.user._id,
    });

    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    res.status(201).json({ task });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/tasks/:id – update task
router.patch('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const { project, isAdmin, isMember } = await getProjectAccess(
      task.project,
      req.user._id
    );
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (isAdmin) {
      // Admin can update anything
      const { title, description, assignedTo, priority, dueDate, status } = req.body;
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (assignedTo !== undefined) task.assignedTo = assignedTo;
      if (priority !== undefined) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate;
      if (status !== undefined) task.status = status;
    } else if (isMember) {
      // Member can only update status of their assigned tasks
      if (task.assignedTo?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You can only update your assigned tasks' });
      }
      const { status } = req.body;
      if (status !== undefined) task.status = status;
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }

    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    res.json({ task });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/tasks/:id – delete task (admin only)
router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const { project, isAdmin } = await getProjectAccess(task.project, req.user._id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!isAdmin) return res.status(403).json({ message: 'Only admin can delete tasks' });

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
