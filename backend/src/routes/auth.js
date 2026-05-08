const express = require('express');
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/worker/register', authController.workerRegister);
router.post('/worker/login', authController.workerLogin);
router.post('/owner/register', authController.ownerRegister);
router.post('/admin/login', authController.adminLogin);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;
