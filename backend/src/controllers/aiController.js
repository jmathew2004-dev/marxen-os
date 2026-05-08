const { v4: uuidv4 } = require('uuid');
const { Anthropic } = require('@anthropic-ai/sdk');
const db = require('../config/database');
const config = require('../config/env');

const anthropic = config.claude.apiKey
  ? new Anthropic({ apiKey: config.claude.apiKey })
  : null;

const getDisplayName = (profile = {}) => {
  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim();
  return fullName || profile.email || 'there';
};

const formatAttendance = (summary) => {
  if (!summary) {
    return 'No attendance summary is available yet.';
  }

  return `${summary.attendance_percentage}% month-to-date (${summary.present_days}/${summary.expected_days} expected workdays present).`;
};

const formatLatestAttendance = (latest) => {
  if (!latest) {
    return 'No check-in has been recorded yet.';
  }

  const checkedOut = latest.check_out_time
    ? `checked out after ${latest.duration_minutes || 0} minutes`
    : 'currently checked in';
  const notes = latest.notes ? ` Notes: ${latest.notes}` : '';
  const voice = latest.voice_transcription ? ` Check-in voice note: ${latest.voice_transcription}` : '';

  return `Latest status: ${latest.status || 'present'}, ${checkedOut}.${notes}${voice}`;
};

const formatWorkContext = (workRows = []) => {
  if (!workRows.length) {
    return 'No work items have been logged yet.';
  }

  return workRows.map((item) => {
    const time = Number(item.time_spent_minutes || 0);
    const bits = [
      item.title,
      item.category_name ? `category ${item.category_name}` : null,
      `${time} min`,
      item.priority ? `${item.priority} priority` : null,
      item.status ? `status ${item.status}` : null,
      item.related_product ? `product ${item.related_product}` : null
    ].filter(Boolean);

    return bits.join(' - ');
  }).join('; ');
};

const normalizeConversationMessages = (history = []) => {
  const normalized = [];

  for (const item of Array.isArray(history) ? history : []) {
    const role = item?.role;
    const content = String(item?.content || '').trim();

    if (!['user', 'assistant'].includes(role) || !content) {
      continue;
    }

    const safeContent = content.slice(0, 4000);
    const previous = normalized[normalized.length - 1];

    if (previous?.role === role) {
      previous.content = `${previous.content}\n\n${safeContent}`;
    } else {
      normalized.push({ role, content: safeContent });
    }
  }

  return normalized.slice(-12);
};

const extractClaudeText = (response) => {
  const text = response?.content
    ?.filter((block) => block.type === 'text' && block.text)
    .map((block) => block.text.trim())
    .join('\n\n')
    .trim();

  return text || 'I am here with you. Tell me the exact thing you want to solve next, and I will help you break it down.';
};

const getUserMentorContext = async (companyId, userId) => {
  const profileQuery = db.query(
    `SELECT u.email, u.first_name, u.last_name, u.role, u.department, u.designation,
            c.name AS company_name
     FROM users u
     JOIN companies c ON c.id = u.company_id
     WHERE u.id = $1 AND u.company_id = $2
     LIMIT 1`,
    [userId, companyId]
  );

  const workQuery = db.query(
    `SELECT wi.title, wi.description, wi.time_spent_minutes, wi.priority, wi.status,
            wi.related_product, wi.created_at, wc.name AS category_name
     FROM work_items wi
     LEFT JOIN work_categories wc ON wi.category_id = wc.id
     WHERE wi.user_id = $1 AND wi.company_id = $2
     ORDER BY wi.created_at DESC
     LIMIT 8`,
    [userId, companyId]
  );

  const attendanceQuery = db.query(
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

  const latestAttendanceQuery = db.query(
    `SELECT check_in_time, check_out_time, duration_minutes, notes, voice_transcription, status
     FROM attendance_records
     WHERE user_id = $1 AND company_id = $2
     ORDER BY check_in_time DESC
     LIMIT 1`,
    [userId, companyId]
  );

  const [profileResult, workResult, attendanceResult, latestAttendanceResult] = await Promise.all([
    profileQuery,
    workQuery,
    attendanceQuery,
    latestAttendanceQuery
  ]);

  return {
    profile: profileResult.rows[0] || {},
    workRows: workResult.rows,
    attendanceSummary: attendanceResult.rows[0],
    latestAttendance: latestAttendanceResult.rows[0] || null
  };
};

const buildMentorSystemPrompt = (context) => {
  const { profile, workRows, attendanceSummary, latestAttendance } = context;
  const attendancePercent = Number(attendanceSummary?.attendance_percentage || 0);
  const attendanceRisk = attendancePercent > 0 && attendancePercent < 75
    ? 'This person is below the 75% attendance benchmark. Be supportive and direct with a recovery plan.'
    : 'Use the 75% attendance benchmark only when it helps the answer.';

  return `You are Marxen AI Buddy, a Claude-powered workplace mentor inside Marxen OS.
You help employees, admins, and owners feel accompanied while they plan work, fix attendance issues, write updates, recover focus, and make cleaner decisions.

User context:
- Name: ${getDisplayName(profile)}
- Role: ${profile.role || 'employee'}
- Department: ${profile.department || 'not set'}
- Designation: ${profile.designation || 'not set'}
- Company: ${profile.company_name || 'Marxen'}
- Attendance: ${formatAttendance(attendanceSummary)}
- Attendance note: ${attendanceRisk}
- Current attendance state: ${formatLatestAttendance(latestAttendance)}
- Recent work: ${formatWorkContext(workRows)}

Rules:
- Never give a repeated canned template. React to the exact user message and the office context above.
- Be warm, sharp, and practical. The user should feel like a capable teammate is sitting beside them.
- Prefer compact sections with helpful names. Use 2 to 5 sections depending on the ask.
- Include concrete next steps, scripts, checklists, or a tiny plan when useful.
- If the user is lonely, tired, stuck, anxious, or demotivated, acknowledge it kindly and give one immediate stabilizing step plus one work step.
- If the user asks for admin communication, write a ready-to-send draft.
- Do not claim you sent emails, changed records, or contacted anyone. Offer drafts and next actions.
- Do not invent data that is not in the context.
- If there is a safety or self-harm concern, encourage reaching emergency or trusted human support immediately.`;
};

const callClaude = async ({ systemPrompt, messages, maxTokens = config.claude.maxTokens }) => {
  if (!anthropic) {
    return null;
  }

  const response = await anthropic.messages.create({
    model: config.claude.model,
    max_tokens: maxTokens,
    temperature: config.claude.temperature,
    system: systemPrompt,
    messages
  });

  return extractClaudeText(response);
};

const fallbackMentorReply = ({ message, context }) => {
  const lowerMessage = message.toLowerCase();
  const name = getDisplayName(context.profile).split(' ')[0];
  const attendancePercent = Number(context.attendanceSummary?.attendance_percentage || 0);
  const recentWork = context.workRows[0]?.title;
  const attendanceLine = `Your current Pulse is ${formatAttendance(context.attendanceSummary)}`;
  const setupNote = 'Claude is not connected on the server yet, so I am using local Buddy mode for now.';

  if (lowerMessage.includes('lonely') || lowerMessage.includes('stuck') || lowerMessage.includes('tired') || lowerMessage.includes('stress')) {
    return [
      `I hear you, ${name}. You do not need to solve the whole day in one breath.`,
      `Right now: take two minutes, name the one thing that feels heaviest, then reduce it to the next visible action.`,
      recentWork
        ? `Since your latest work is "${recentWork}", restart with a tiny checkpoint: what is done, what is blocked, and what needs 25 focused minutes.`
        : 'Start with one work log or one admin update so the day has a clear anchor.',
      attendancePercent > 0 && attendancePercent < 75
        ? `${attendanceLine} Let us protect tomorrow first: check in on time, log one work item, and send a quick update before noon.`
        : attendanceLine,
      `${setupNote} Once you add the Claude API key, I will become much more adaptive.`
    ].join('\n\n');
  }

  if (lowerMessage.includes('attendance') || lowerMessage.includes('pulse') || lowerMessage.includes('75')) {
    return [
      `Pulse plan for ${name}:`,
      attendanceLine,
      attendancePercent < 75
        ? 'You are below the 75% benchmark, so the goal is not panic. The goal is consistency for the next 5 workdays.'
        : 'You are not in danger mode, but consistency will keep the score clean.',
      'Next steps: check in early, write one work note before the first break, and check out with a follow-up item so the record looks complete.',
      `${setupNote}`
    ].join('\n\n');
  }

  if (lowerMessage.includes('admin') || lowerMessage.includes('update') || lowerMessage.includes('mail') || lowerMessage.includes('message')) {
    return [
      'Ready-to-send update:',
      `Hi Team, quick update from my side: I am focusing on ${recentWork || 'the highest priority task'} now. I will share the next checkpoint before end of day, and I will flag blockers early if anything slows progress.`,
      'Make it stronger by adding one result, one blocker, and one ETA.',
      `${setupNote}`
    ].join('\n\n');
  }

  return [
    `Here is a clean next move, ${name}:`,
    recentWork
      ? `Continue from "${recentWork}" and define the smallest finished outcome for the next 45 minutes.`
      : 'Create one work item, choose one outcome, and start with a 25-minute focus block.',
    `Keep the day visible: log progress, share blockers early, and close with one follow-up note after checkout.`,
    attendancePercent > 0 && attendancePercent < 75
      ? `${attendanceLine} The recovery target is simple: show up consistently, not perfectly.`
      : attendanceLine,
    `${setupNote}`
  ].join('\n\n');
};

const fallbackRecommendations = (context) => {
  const recentWork = context.workRows[0]?.title;
  const attendancePercent = Number(context.attendanceSummary?.attendance_percentage || 0);

  return [
    `1. Flow Sprint: ${recentWork ? `finish the next visible part of "${recentWork}"` : 'create one clear work item and finish the smallest useful version'}.`,
    `2. Pulse Guard: ${attendancePercent > 0 && attendancePercent < 75 ? 'protect check-in consistency until you cross the 75% benchmark' : 'keep attendance clean with check-in, work log, and checkout notes'}.`,
    '3. Clean Ping: send one short admin update before a blocker becomes late.',
    '4. Reset Ritual: use a 25-minute focus block, then write the next follow-up while it is fresh.'
  ].join('\n');
};

const sendMentorMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;
    const companyId = req.user.company_id;

    const userMessage = String(message || '').trim();

    if (!userMessage) {
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

    const context = await getUserMentorContext(companyId, userId);
    const systemPrompt = buildMentorSystemPrompt(context);
    const claudeMessages = normalizeConversationMessages([
      ...messages,
      { role: 'user', content: userMessage }
    ]);

    let assistantMessage;
    let provider = anthropic ? 'claude' : 'fallback';
    let providerStatus = anthropic ? 'Claude connected' : 'Claude API key missing';

    try {
      assistantMessage = await callClaude({
        systemPrompt,
        messages: claudeMessages
      });
    } catch (error) {
      console.error('Claude AI error:', error.message);
      provider = 'fallback';
      providerStatus = 'Claude unavailable';
    }

    if (!assistantMessage) {
      provider = 'fallback';
      assistantMessage = fallbackMentorReply({ message: userMessage, context });
    }

    // Add messages to conversation history
    messages.push({ role: 'user', content: userMessage, timestamp: new Date() });
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
      conversation_id: conversation.id,
      provider,
      model: provider === 'claude' ? config.claude.model : null,
      provider_status: providerStatus
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
    res.json({
      conversation: conversation || { messages: [] },
      provider: anthropic ? 'claude' : 'fallback',
      model: anthropic ? config.claude.model : null
    });
  } catch (error) {
    next(error);
  }
};

const getWorkRecommendations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const companyId = req.user.company_id;

    const context = await getUserMentorContext(companyId, userId);

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

    let recommendations;
    let provider = anthropic ? 'claude' : 'fallback';
    let providerStatus = anthropic ? 'Claude connected' : 'Claude API key missing';

    try {
      recommendations = await callClaude({
        systemPrompt: buildMentorSystemPrompt(context),
        maxTokens: 450,
        messages: [{
          role: 'user',
          content: `Create today's Marxen AI Buddy recommendations. Use this work pattern summary: ${patterns || 'No work pattern yet'}. Return 4 short, specific, motivating bullets with Gen Z-friendly feature names like Flow Sprint, Pulse Guard, Clean Ping, and Reset Ritual.`
        }]
      });
    } catch (error) {
      console.error('Claude recommendations error:', error.message);
      provider = 'fallback';
      providerStatus = 'Claude unavailable';
    }

    if (!recommendations) {
      provider = 'fallback';
      recommendations = fallbackRecommendations(context);
    }

    res.json({
      recommendations,
      patterns,
      provider,
      model: provider === 'claude' ? config.claude.model : null,
      provider_status: providerStatus
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
