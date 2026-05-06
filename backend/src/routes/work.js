const express = require('express');
const workController = require('../controllers/workController');
const { authMiddleware, managerMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/categories', workController.getCategories);
router.post('/log-work', workController.logWork);
router.get('/my-work', workController.getMyWork);
router.get('/team-work', managerMiddleware, workController.getTeamWork);
router.put('/work/:id', workController.updateWorkItem);
router.delete('/work/:id', workController.deleteWorkItem);

module.exports = router;
