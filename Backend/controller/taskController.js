const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { status, priority, projectId, assignedTo, search } = req.query;

    let filter = {};

    // Role-based filtering
    if (req.user.role !== 'admin') {
      filter.assignedTo = req.user._id;
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (projectId) filter.project = projectId;
    if (assignedTo && req.user.role === 'admin') filter.assignedTo = assignedTo;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const tasks = await Task.find(filter)
      .populate('project', 'name color')
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email')
      .sort({ dueDate: 1, createdAt: -1 });

    // Add isOverdue virtual to response
    const tasksWithOverdue = tasks.map((task) => {
      const taskObj = task.toObject({ virtuals: true });
      return taskObj;
    });

    res.json({
      success: true,
      count: tasks.length,
      data: { tasks: tasksWithOverdue },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name color members')
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Check access for members
    if (
      req.user.role !== 'admin' &&
      task.assignedTo?._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this task',
      });
    }

    res.json({
      success: true,
      data: { task: task.toObject({ virtuals: true }) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create task
// @route   POST /api/tasks
// @access  Private/Admin
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, project, assignedTo, tags } =
      req.body;

    // Validate project exists
    const projectExists = await Project.findById(project);
    if (!projectExists) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Validate assigned user is a member of the project
    if (assignedTo) {
      const isMember =
        projectExists.members.some((m) => m.toString() === assignedTo) ||
        projectExists.owner.toString() === assignedTo;

      if (!isMember) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user is not a member of this project',
        });
      }
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      project,
      assignedTo,
      tags,
      createdBy: req.user._id,
    });

    const populated = await Task.findById(task._id)
      .populate('project', 'name color')
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task: populated.toObject({ virtuals: true }) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Members can only update status
    if (req.user.role !== 'admin') {
      if (task.assignedTo?.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this task',
        });
      }
      // Members can only change status
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Members can only update task status',
        });
      }
      req.body = { status };
    }

    task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    )
      .populate('project', 'name color')
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: { task: task.toObject({ virtuals: true }) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get task statistics
// @route   GET /api/tasks/stats
// @access  Private
const getTaskStats = async (req, res) => {
  try {
    let matchFilter = {};

    if (req.user.role !== 'admin') {
      matchFilter.assignedTo = req.user._id;
    }

    const stats = await Task.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const now = new Date();
    const overdueCount = await Task.countDocuments({
      ...matchFilter,
      status: { $ne: 'done' },
      dueDate: { $lt: now },
    });

    const totalCount = await Task.countDocuments(matchFilter);

    const formattedStats = {
      total: totalCount,
      overdue: overdueCount,
      todo: 0,
      inProgress: 0,
      done: 0,
    };

    stats.forEach((stat) => {
      if (stat._id === 'todo') formattedStats.todo = stat.count;
      if (stat._id === 'in-progress') formattedStats.inProgress = stat.count;
      if (stat._id === 'done') formattedStats.done = stat.count;
    });

    res.json({
      success: true,
      data: { stats: formattedStats },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask, getTaskStats };