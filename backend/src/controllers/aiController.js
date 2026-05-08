const { v4: uuidv4 } = require('uuid');
const { Anthropic } = require('@anthropic-ai/sdk');
const db = require('../config/database');
const config = require('../config/env');

const anthropic = new Anthropic({
  apiKey: config.claude.apiKey
});

const fallbackMentorReply = ({ message, workContext, attendanceSummary }) => {
  const attendanceLine = attendanceSummary
    ? `Your current attendance is ${attendanceSummary.attendance_percentage}%, with ${attendanceSummary.present_days}/${attendanceSummary.expected_days} working days logged.`
    : 'I could not read your attendance summary right now.';

  return [
    `I am here with you. You do not have to carry the day alone.`,
    attendanceLine,
    workContext
      ? `I can see your recent work pattern: ${workContext}.`
      : 'Start with one clear task, keep it small enough to finish, and then build momentum from there.',
    `For your message, "${message}", my practical suggestion is: pick the next 25-minute focus block, write the exact outcome you want, and share one blocker early instead of waiting until the end of the day.`,
    `You are allowed to have a heavy day and still make meaningful progress. One clean step counts.`
  ].join('\n\n');
};

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

    const attendanceResult = await db.query(
      `WITH bounds AS (
         SELECT date_trunc('month', CURRENT_DATE)::date AS start_date, CURRENT_DATE::date AS end_date
       ),
       working_days AS (
         SELECT COUNT(*)::int AS expected_days
         FROM bounds, generate_series(bounds.start_date, bounds.end_date, interval '1 day') AS days(day)
         WHERE EXTRACT(ISODOW FROM days.day) <= 5
       ),
       present_days AS (
         SELECT COUNT(DISTINCT check_in_time::date)::int AS present_days
         FROM attendance_records, bounds
         WHERE company_id = $1 AND user_id = $2
           AND check_in_time::date BETWEEN bounds.start_date AND bounds.end_date
       )
       SELECT
         COALESCE(present_days.present_days, 0)::int AS present_days,
         GREATEST(working_days.expected_days, 1)::int AS expected_days,
         ROUND((COALESCE(present_days.present_days, 0)::numeric * 100) / GREATEST(working_days.expected_days, 1), 1) AS attendance_percentage
       FROM working_days CROSS JOIN present_days`,
      [companyId, userId]
    );

    const attendanceSummary = attendanceResult.rows[0];

    const systemPrompt = `You are Marxen Mentor inside a corporate office portal.
You support employees and admins with planning, attendance accountability, productivity, communication, and motivation.
The person should never feel alone. Be warm, grounded, and practical without pretending to be a therapist.
Give answers in short sections: "What I see", "Next best step", and "Encouragement".
If attendance or work data suggests risk, mention it gently and suggest a concrete follow-up.
Recent work: ${workContext || 'No work logged yet'}.
Attendance: ${attendanceSummary?.attendance_percentage || 0}% month-to-date.`;

    let assistantMessage;
    if (config.claude.apiKey) {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 700,
        system: systemPrompt,
        messages: [
          ...messages.slice(-12).map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: message }
        ]
      });
      assistantMessage = response.content[0].text;
    } else {
      assistantMessage = fallbackMentorReply({ message, workContext, attendanceSummary });
    }

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

    res.json({
      recommendations: config.claude.apiKey
        ? (await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 350,
          messages: [{
            role: 'user',
            content: `Based on this work pattern: ${patterns || 'No work yet'}, suggest 3 productive work areas for today. Be specific, motivating, and actionable.`
          }]
        })).content[0].text
        : `1. Choose one high-value task and finish the smallest useful version.\n2. Log your current work before breaks so your progress is visible.\n3. If you feel stuck, send one update to your admin early. You are part of a team, not working alone.`,
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
