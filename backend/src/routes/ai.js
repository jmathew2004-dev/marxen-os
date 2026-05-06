const express = require('express');
const aiController = require('../controllers/aiController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.post('/mentor/message', aiController.sendMentorMessage);
router.get('/mentor/history', aiController.getConversationHistory);
router.get('/work/recommend', aiController.getWorkRecommendations);

module.exports = router;
