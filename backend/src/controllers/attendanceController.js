const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

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

    res.status(201).json({ message: 'Checked in', attendance: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

const checkOut = async (req, res, next) => {
  try {
    const { notes } = req.body;
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

    res.json({ message: 'Checked out', attendance: result.rows[0] });
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

module.exports = {
  checkIn,
  checkOut,
  getHistory,
  getTodayStatus,
  getTeamStatus
};
