const express = require('express');
const notificationController = require('../controllers/notificationController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', notificationController.listNotifications);
router.put('/:id/read', notificationController.markNotificationRead);
router.put('/read-all', notificationController.markAllNotificationsRead);

module.exports = router;
