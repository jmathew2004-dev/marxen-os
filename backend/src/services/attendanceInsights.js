const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

const ATTENDANCE_THRESHOLD = 75;

const attendanceStatus = (percentage) => {
  if (percentage >= 90) return 'excellent';
  if (percentage >= ATTENDANCE_THRESHOLD) return 'on_track';
  return 'attention';
};

const monthWindowSql = `
  WITH bounds AS (
    SELECT
      date_trunc('month', CURRENT_DATE)::date AS start_date,
      CURRENT_DATE::date AS end_date
  ),
  working_days AS (
    SELECT COUNT(*)::int AS expected_days
    FROM bounds,
         generate_series(bounds.start_date, bounds.end_date, interval '1 day') AS days(day)
    WHERE EXTRACT(ISODOW FROM days.day) <= 5
  )
`;

const getUserAttendanceSummary = async (companyId, userId) => {
  const result = await db.query(
    `${monthWindowSql},
    present_days AS (
      SELECT COUNT(DISTINCT ar.check_in_time::date)::int AS present_days
      FROM attendance_records ar, bounds
      WHERE ar.company_id = $1
        AND ar.user_id = $2
        AND ar.check_in_time::date BETWEEN bounds.start_date AND bounds.end_date
    ),
    today AS (
      SELECT ar.check_in_time, ar.check_out_time, ar.duration_minutes
      FROM attendance_records ar
      WHERE ar.company_id = $1
        AND ar.user_id = $2
        AND ar.check_in_time::date = CURRENT_DATE
      ORDER BY ar.check_in_time DESC
      LIMIT 1
    ),
    current_work AS (
      SELECT title, status, created_at
      FROM work_items
      WHERE company_id = $1
        AND user_id = $2
        AND status = 'in_progress'
      ORDER BY updated_at DESC
      LIMIT 1
    )
    SELECT
      COALESCE(present_days.present_days, 0)::int AS present_days,
      GREATEST(working_days.expected_days, 1)::int AS expected_days,
      ROUND((COALESCE(present_days.present_days, 0)::numeric * 100) / GREATEST(working_days.expected_days, 1), 1) AS attendance_percentage,
      today.check_in_time,
      today.check_out_time,
      today.duration_minutes,
      current_work.title AS current_work_title,
      current_work.status AS current_work_status,
      current_work.created_at AS current_work_started_at
    FROM working_days
    CROSS JOIN present_days
    LEFT JOIN today ON true
    LEFT JOIN current_work ON true`,
    [companyId, userId]
  );

  const summary = result.rows[0] || {
    present_days: 0,
    expected_days: 1,
    attendance_percentage: 0,
    check_in_time: null,
    check_out_time: null,
    duration_minutes: null
  };

  const percentage = Number(summary.attendance_percentage || 0);

  return {
    ...summary,
    attendance_percentage: percentage,
    threshold: ATTENDANCE_THRESHOLD,
    status: attendanceStatus(percentage)
  };
};

const getTeamAttendanceSummary = async (companyId) => {
  const result = await db.query(
    `${monthWindowSql},
    team AS (
      SELECT id, email, first_name, last_name, role, department, designation
      FROM users
      WHERE company_id = $1
        AND is_active = true
        AND role IN ('employee', 'manager')
    ),
    present_days AS (
      SELECT ar.user_id, COUNT(DISTINCT ar.check_in_time::date)::int AS present_days
      FROM attendance_records ar, bounds
      WHERE ar.company_id = $1
        AND ar.check_in_time::date BETWEEN bounds.start_date AND bounds.end_date
      GROUP BY ar.user_id
    ),
    today AS (
      SELECT DISTINCT ON (ar.user_id)
        ar.user_id,
        ar.check_in_time,
        ar.check_out_time,
        ar.duration_minutes
      FROM attendance_records ar
      WHERE ar.company_id = $1
        AND ar.check_in_time::date = CURRENT_DATE
      ORDER BY ar.user_id, ar.check_in_time DESC
    ),
    current_work AS (
      SELECT DISTINCT ON (wi.user_id)
        wi.user_id,
        wi.title,
        wi.status,
        wi.created_at
      FROM work_items wi
      WHERE wi.company_id = $1
        AND wi.status = 'in_progress'
      ORDER BY wi.user_id, wi.updated_at DESC
    )
    SELECT
      team.id,
      team.email,
      team.first_name,
      team.last_name,
      team.role,
      team.department,
      team.designation,
      COALESCE(present_days.present_days, 0)::int AS present_days,
      GREATEST(working_days.expected_days, 1)::int AS expected_days,
      ROUND((COALESCE(present_days.present_days, 0)::numeric * 100) / GREATEST(working_days.expected_days, 1), 1) AS attendance_percentage,
      today.check_in_time,
      today.check_out_time,
      today.duration_minutes,
      current_work.title AS current_work_title,
      current_work.status AS current_work_status,
      current_work.created_at AS current_work_started_at
    FROM team
    CROSS JOIN working_days
    LEFT JOIN present_days ON present_days.user_id = team.id
    LEFT JOIN today ON today.user_id = team.id
    LEFT JOIN current_work ON current_work.user_id = team.id
    ORDER BY attendance_percentage ASC, team.first_name ASC NULLS LAST`,
    [companyId]
  );

  const team = result.rows.map((member) => {
    const percentage = Number(member.attendance_percentage || 0);
    return {
      ...member,
      attendance_percentage: percentage,
      threshold: ATTENDANCE_THRESHOLD,
      status: attendanceStatus(percentage),
      present_today: Boolean(member.check_in_time)
    };
  });

  const totalWorkers = team.length;
  const presentToday = team.filter((member) => member.present_today).length;
  const belowThreshold = team.filter((member) => member.attendance_percentage < ATTENDANCE_THRESHOLD).length;
  const averageAttendance = totalWorkers
    ? Number((team.reduce((sum, member) => sum + member.attendance_percentage, 0) / totalWorkers).toFixed(1))
    : 0;

  return {
    threshold: ATTENDANCE_THRESHOLD,
    metrics: {
      total_workers: totalWorkers,
      present_today: presentToday,
      below_threshold: belowThreshold,
      average_attendance: averageAttendance
    },
    team
  };
};

const createNotification = async ({ companyId, userId, type, severity = 'info', title, message, metadata = {}, queueEmail = false, recipientEmail }) => {
  const notificationId = uuidv4();
  const result = await db.query(
    `INSERT INTO notifications (id, company_id, user_id, type, severity, title, message, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [notificationId, companyId, userId, type, severity, title, message, JSON.stringify(metadata)]
  );

  if (queueEmail && recipientEmail) {
    await db.query(
      `INSERT INTO email_outbox (id, company_id, notification_id, recipient_email, subject, body)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), companyId, notificationId, recipientEmail, title, message]
    );
  }

  return result.rows[0];
};

const createAttendanceAlertIfNeeded = async (companyId, userId) => {
  const summary = await getUserAttendanceSummary(companyId, userId);

  if (summary.attendance_percentage >= ATTENDANCE_THRESHOLD) {
    return { summary, alerts_created: 0 };
  }

  const userResult = await db.query(
    `SELECT id, email, first_name, last_name
     FROM users
     WHERE id = $1 AND company_id = $2`,
    [userId, companyId]
  );
  const worker = userResult.rows[0];

  if (!worker) {
    return { summary, alerts_created: 0 };
  }

  const duplicateResult = await db.query(
    `SELECT id
     FROM notifications
     WHERE company_id = $1
       AND type = 'attendance_below_threshold'
       AND metadata->>'tracked_user_id' = $2
       AND created_at::date = CURRENT_DATE
     LIMIT 1`,
    [companyId, userId]
  );

  if (duplicateResult.rows.length) {
    return { summary, alerts_created: 0 };
  }

  const workerName = `${worker.first_name || ''} ${worker.last_name || ''}`.trim() || worker.email;
  const metadata = {
    tracked_user_id: userId,
    attendance_percentage: summary.attendance_percentage,
    threshold: ATTENDANCE_THRESHOLD,
    present_days: summary.present_days,
    expected_days: summary.expected_days,
    period: 'month_to_date'
  };

  let alertsCreated = 0;

  await createNotification({
    companyId,
    userId,
    type: 'attendance_below_threshold',
    severity: 'warning',
    title: 'Attendance below 75%',
    message: `Your month-to-date attendance is ${summary.attendance_percentage}%. Please regularize attendance or speak with your admin.`,
    metadata,
    queueEmail: true,
    recipientEmail: worker.email
  });
  alertsCreated += 1;

  const adminResult = await db.query(
    `SELECT id, email
     FROM users
     WHERE company_id = $1
       AND is_active = true
       AND role IN ('owner', 'admin')`,
    [companyId]
  );

  for (const admin of adminResult.rows) {
    await createNotification({
      companyId,
      userId: admin.id,
      type: 'attendance_below_threshold',
      severity: 'warning',
      title: 'Worker attendance alert',
      message: `${workerName} is at ${summary.attendance_percentage}% attendance against the 75% average benchmark.`,
      metadata,
      queueEmail: true,
      recipientEmail: admin.email
    });
    alertsCreated += 1;
  }

  return { summary, alerts_created: alertsCreated };
};

module.exports = {
  ATTENDANCE_THRESHOLD,
  getUserAttendanceSummary,
  getTeamAttendanceSummary,
  createAttendanceAlertIfNeeded
};
