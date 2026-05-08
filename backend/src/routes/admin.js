const express = require('express');
const adminController = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.post('/company/setup', adminController.setupCompany);
router.put('/company/:id', adminController.updateCompany);
router.get('/reports/attendance.csv', adminController.downloadAttendanceReport);
router.get('/reports/work.csv', adminController.downloadWorkReport);
router.post('/whitelist', adminController.addWorkerWhitelist);
router.get('/whitelist', adminController.listWorkerWhitelist);
router.delete('/whitelist/:id', adminController.removeWorkerWhitelist);
router.post('/users', adminController.addTeamMember);
router.get('/users', adminController.listTeamMembers);
router.put('/users/:id', adminController.updateTeamMember);
router.delete('/users/:id', adminController.removeTeamMember);

module.exports = router;
