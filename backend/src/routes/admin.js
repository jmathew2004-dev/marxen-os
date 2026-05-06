const express = require('express');
const adminController = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.post('/company/setup', adminController.setupCompany);
router.put('/company/:id', adminController.updateCompany);
router.post('/users', adminController.addTeamMember);
router.get('/users', adminController.listTeamMembers);
router.put('/users/:id', adminController.updateTeamMember);
router.delete('/users/:id', adminController.removeTeamMember);

module.exports = router;
