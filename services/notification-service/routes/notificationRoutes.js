const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require('../controllers/notificationController');

// Create notification (internal service call)
router.post('/', createNotification);

// Get user notifications
router.get('/', authenticate, getNotifications);

// Mark as read
router.patch('/:notificationId/read', authenticate, markAsRead);

// Mark all as read
router.patch('/read-all', authenticate, markAllAsRead);

// Delete notification
router.delete('/:notificationId', authenticate, deleteNotification);

module.exports = router;
