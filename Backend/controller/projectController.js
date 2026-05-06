const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    let query;

    if (req.user.role === 'admin') {
      // Admin sees all projects
      query = Project.find();
    } else {
      // Member sees only their projects
      query = Project.find({
        $or: [
          { owner: req.user._id },
          { members: req.user._id },
        ],
      });
    }

    const projects = await query
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar')
      .populate('taskCount')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: projects.length,
      data: { projects },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check access
    const isMember = project.members.some(
      (m) => m._id.toString() === req.user._id.toString()
    );
    const isOwner = project.owner._id.toString() === req.user._id.toString();

    if (req.user.role !== 'admin' && !isMember && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this project',
      });
    }

    res.json({ success: true, data: { project } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create project
// @route   POST /api/projects
// @access  Private/Admin
const createProject = async (req, res) => {
  try {
    const { name, description, status, priority, color, members, dueDate } = req.body;

    // Validate members exist
    if (members && members.length > 0) {
      const users = await User.find({ _id: { $in: members } });
      if (users.length !== members.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more members not found',
        });
      }
    }

    const project = await Project.create({
      name,
      description,
      status,
      priority,
      color,
      members: members || [],
      dueDate,
      owner: req.user._id,
    });

    const populated = await Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project: populated },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private/Admin
const updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    project = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    )
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar');

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: { project },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Delete all tasks in this project
    await Task.deleteMany({ project: req.params.id });
    await Project.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Project and all associated tasks deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private/Admin
const addMember = async (req, res) => {
  try {
    const { userId } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (project.members.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this project',
      });
    }

    project.members.push(userId);
    await project.save();

    const updated = await Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar');

    res.json({
      success: true,
      message: 'Member added successfully',
      data: { project: updated },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private/Admin
const removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    project.members = project.members.filter(
      (m) => m.toString() !== req.params.userId
    );
    await project.save();

    const updated = await Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar');

    res.json({
      success: true,
      message: 'Member removed successfully',
      data: { project: updated },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
};