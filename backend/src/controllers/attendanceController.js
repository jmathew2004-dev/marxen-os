const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const {
  createAttendanceAlertIfNeeded,
  getTeamAttendanceSummary,
  getUserAttendanceSummary
} = require('../services/attendanceInsights');
const { employeeReportCsv, getEmployeeReport } = require('../services/reporting');

const checkIn = async (req, res, next) => {
  try {
    const { voice_transcription } = req.body;
    const userId = req.user.id;
    const companyId = req.user.company_id;

    const result = await db.query(
      `INSERT INTO attendance_records (id, user_id, company_id, check_in_time, voice_transcription, status)
       VALUES ($1, $2, $3, NOW(), $4, 'present')
       RETURNING id, user_id, check_in_time`,
      [uuidv4(), userId, companyId, voice_transcription || null]
    );

    const insights = await createAttendanceAlertIfNeeded(companyId, userId);

    res.status(201).json({
      message: 'Checked in',
      attendance: result.rows[0],
      attendance_summary: insights.summary,
      alerts_created: insights.alerts_created
    });
  } catch (error) {
    next(error);
  }
};

const checkOut = async (req, res, next) => {
  try {
    const { notes, follow_up } = req.body;
    const userId = req.user.id;
    const companyId = req.user.company_id;

    // Find the most recent check-in without check-out
    const findResult = await db.query(
      `SELECT id, check_in_time FROM attendance_records
       WHERE user_id = $1 AND company_id = $2 AND check_out_time IS NULL
       ORDER BY check_in_time DESC LIMIT 1`,
      [userId, companyId]
    );

    if (!findResult.rows.length) {
      return res.status(404).json({ error: 'No active check-in found' });
    }

    const attendanceId = findResult.rows[0].id;
    const checkInTime = findResult.rows[0].check_in_time;
    const checkOutTime = new Date();
    const durationMinutes = Math.round((checkOutTime - checkInTime) / 60000);

    const result = await db.query(
      `UPDATE attendance_records
       SET check_out_time = $1, duration_minutes = $2, notes = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [checkOutTime, durationMinutes, notes || null, attendanceId]
    );

    let followUpWorkItem = null;
    if (follow_up?.title) {
      const workResult = await db.query(
        `INSERT INTO work_items (
           id, company_id, user_id, title, description, time_spent_minutes,
           priority, status, related_product
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          uuidv4(),
          companyId,
          userId,
          follow_up.title,
          follow_up.description || notes || null,
          follow_up.time_spent_minutes || durationMinutes || 0,
          follow_up.priority || 'medium',
          follow_up.status || 'completed',
          follow_up.related_product || null
        ]
      );
      followUpWorkItem = workResult.rows[0];
    }

    const insights = await createAttendanceAlertIfNeeded(companyId, userId);

    res.json({
      message: 'Checked out',
      attendance: result.rows[0],
      follow_up_work_item: followUpWorkItem,
      attendance_summary: insights.summary,
      alerts_created: insights.alerts_created
    });
  } catch (error) {
    next(error);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const limit = req.query.limit || 30;

    const result = await db.query(
      `SELECT * FROM attendance_records
       WHERE user_id = $1
       ORDER BY check_in_time DESC
       LIMIT $2`,
      [userId, limit]
    );

    res.json({ attendance: result.rows });
  } catch (error) {
    next(error);
  }
};

const getTodayStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const companyId = req.user.company_id;

    const result = await db.query(
      `SELECT * FROM attendance_records
       WHERE user_id = $1 AND company_id = $2
       AND DATE(check_in_time) = CURRENT_DATE`,
      [userId, companyId]
    );

    const today = result.rows[0] || null;
    res.json({ today });
  } catch (error) {
    next(error);
  }
};

const getTeamStatus = async (req, res, next) => {
  try {
    const companyId = req.user.company_id;

    const result = await db.query(
      `SELECT u.id, u.first_name, u.last_name, ar.check_in_time, ar.check_out_time, ar.status
       FROM attendance_records ar
       JOIN users u ON ar.user_id = u.id
       WHERE ar.company_id = $1
       AND DATE(ar.check_in_time) = CURRENT_DATE
       ORDER BY u.first_name`,
      [companyId]
    );

    res.json({ team_status: result.rows });
  } catch (error) {
    next(error);
  }
};

const getMySummary = async (req, res, next) => {
  try {
    const summary = await getUserAttendanceSummary(req.user.company_id, req.user.id);
    res.json({ summary });
  } catch (error) {
    next(error);
  }
};

const getTeamSummary = async (req, res, next) => {
  try {
    const summary = await getTeamAttendanceSummary(req.user.company_id);
    res.json(summary);
  } catch (error) {
    next(error);
  }
};

const getMyReport = async (req, res, next) => {
  try {
    const period = req.query.period === 'month' ? 'month' : 'week';
    const report = await getEmployeeReport(req.user.company_id, req.user.id, period);

    if (req.query.format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="marxen-${period}-report.csv"`);
      return res.send(employeeReportCsv(report));
    }

    return res.json({ report });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkIn,
  checkOut,
  getHistory,
  getTodayStatus,
  getTeamStatus,
  getMySummary,
  getTeamSummary,
  getMyReport
};
