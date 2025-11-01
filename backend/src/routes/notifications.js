const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');

// Route to send email notifications
router.post('/send', emailController.sendEmail);

// Route to get all notifications (if applicable)
router.get('/', emailController.getAllNotifications);

// Route to get a specific notification by ID (if applicable)
router.get('/:id', emailController.getNotificationById);

// Route to delete a notification by ID (if applicable)
router.delete('/:id', emailController.deleteNotificationById);

module.exports = router;