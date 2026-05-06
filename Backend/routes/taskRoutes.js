const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
} = require('../controller/taskController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/stats', getTaskStats);

router.route('/')
  .get(getTasks)
  .post(authorize('admin'), createTask);

router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(authorize('admin'), deleteTask);

module.exports = router;