const { v4: uuidv4 } = require('uuid');
const { Anthropic } = require('@anthropic-ai/sdk');
const db = require('../config/database');
const config = require('../config/env');

const anthropic = new Anthropic({
  apiKey: config.claude.apiKey
});

const sendMentorMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;
    const companyId = req.user.company_id;

    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }

    // Get or create conversation
    let convResult = await db.query(
      `SELECT * FROM ai_mentor_conversations WHERE user_id = $1 AND company_id = $2`,
      [userId, companyId]
    );

    let conversation = convResult.rows[0];
    let messages = [];

    if (conversation) {
      messages = conversation.messages || [];
    } else {
      conversation = {
        id: uuidv4(),
        user_id: userId,
        company_id: companyId,
        messages: []
      };
    }

    // Get user work history for context
    const workResult = await db.query(
      `SELECT title, description, time_spent_minutes, status, created_at
       FROM work_items WHERE user_id = $1 LIMIT 10`,
      [userId]
    );

    const workContext = workResult.rows.map(w =>
      `${w.title} (${w.time_spent_minutes}min) - ${w.status}`
    ).join(', ');

    const systemPrompt = `You are an AI Mentor for a team member. You help them with work planning, productivity tips, and career guidance.
Be supportive, encouraging, and practical. Keep responses concise and actionable.
The user's recent work: ${workContext || 'No work logged yet'}`;

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      system: systemPrompt,
      messages: [
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: message }
      ]
    });

    const assistantMessage = response.content[0].text;

    // Add messages to conversation history
    messages.push({ role: 'user', content: message, timestamp: new Date() });
    messages.push({ role: 'assistant', content: assistantMessage, timestamp: new Date() });

    // Save or update conversation
    if (convResult.rows.length) {
      await db.query(
        `UPDATE ai_mentor_conversations SET messages = $1, updated_at = NOW() WHERE id = $2`,
        [JSON.stringify(messages), conversation.id]
      );
    } else {
      await db.query(
        `INSERT INTO ai_mentor_conversations (id, user_id, company_id, messages)
         VALUES ($1, $2, $3, $4)`,
        [conversation.id, userId, companyId, JSON.stringify(messages)]
      );
    }

    res.json({
      message: assistantMessage,
      conversation_id: conversation.id
    });
  } catch (error) {
    console.error('AI error:', error);
    next(error);
  }
};

const getConversationHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const companyId = req.user.company_id;

    const result = await db.query(
      `SELECT * FROM ai_mentor_conversations WHERE user_id = $1 AND company_id = $2`,
      [userId, companyId]
    );

    const conversation = result.rows[0];
    res.json({ conversation: conversation || { messages: [] } });
  } catch (error) {
    next(error);
  }
};

const getWorkRecommendations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const companyId = req.user.company_id;

    // Get user's work patterns
    const workResult = await db.query(
      `SELECT category_id, COUNT(*) as count, AVG(time_spent_minutes) as avg_time
       FROM work_items WHERE user_id = $1 AND company_id = $2
       GROUP BY category_id LIMIT 5`,
      [userId, companyId]
    );

    const categories = await db.query(
      `SELECT id, name FROM work_categories WHERE company_id = $1 AND is_active = true`,
      [companyId]
    );

    const patterns = workResult.rows.map(w => {
      const cat = categories.rows.find(c => c.id === w.category_id);
      return `${cat?.name || 'Other'}: ${w.count} tasks (avg ${Math.round(w.avg_time)}min)`;
    }).join(', ');

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: `Based on this work pattern: ${patterns}, suggest 3 productive work areas for today. Be specific and actionable.`
      }]
    });

    res.json({
      recommendations: response.content[0].text,
      patterns
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMentorMessage,
  getConversationHistory,
  getWorkRecommendations
};
