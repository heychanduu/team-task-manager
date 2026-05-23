const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/dashboard – aggregated stats for current user
router.get('/', auth, async (req, res) => {
  try {
    // Get all projects the user is part of
    const projects = await Project.find({
      $or: [{ admin: req.user._id }, { members: req.user._id }],
    });

    const projectIds = projects.map((p) => p._id);

    // Get all tasks in those projects
    const allTasks = await Task.find({ project: { $in: projectIds } })
      .populate('assignedTo', 'name email');

    const now = new Date();

    const totalTasks = allTasks.length;
    const todoTasks = allTasks.filter((t) => t.status === 'todo').length;
    const inProgressTasks = allTasks.filter((t) => t.status === 'in-progress').length;
    const doneTasks = allTasks.filter((t) => t.status === 'done').length;
    const overdueTasks = allTasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done'
    ).length;

    // Tasks per user
    const tasksPerUser = {};
    allTasks.forEach((t) => {
      if (t.assignedTo) {
        const key = t.assignedTo.name || t.assignedTo.email;
        tasksPerUser[key] = (tasksPerUser[key] || 0) + 1;
      }
    });

    res.json({
      totalTasks,
      todoTasks,
      inProgressTasks,
      doneTasks,
      overdueTasks,
      tasksPerUser,
      totalProjects: projects.length,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
