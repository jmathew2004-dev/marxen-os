const express = require('express');
const attendanceController = require('../controllers/attendanceController');
const { authMiddleware, managerMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.post('/check-in', attendanceController.checkIn);
router.post('/check-out', attendanceController.checkOut);
router.get('/history', attendanceController.getHistory);
router.get('/today', attendanceController.getTodayStatus);
router.get('/summary', attendanceController.getMySummary);
router.get('/report', attendanceController.getMyReport);
router.get('/team-status', managerMiddleware, attendanceController.getTeamStatus);
router.get('/team-summary', managerMiddleware, attendanceController.getTeamSummary);

module.exports = router;
