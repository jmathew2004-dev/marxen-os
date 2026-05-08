const db = require('../config/database');
const { getTeamAttendanceSummary, getUserAttendanceSummary } = require('./attendanceInsights');

const csvEscape = (value) => {
  if (value === null || value === undefined) return '';
  const stringValue = String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

const toCsv = (headers, rows) => {
  const headerRow = headers.map((header) => csvEscape(header.label)).join(',');
  const bodyRows = rows.map((row) => headers.map((header) => csvEscape(row[header.key])).join(','));
  return [headerRow, ...bodyRows].join('\n');
};

const periodSql = (period) => {
  if (period === 'week') {
    return {
      label: 'Weekly',
      start: "date_trunc('week', CURRENT_DATE)::date",
      end: 'CURRENT_DATE::date'
    };
  }

  return {
    label: 'Monthly',
    start: "date_trunc('month', CURRENT_DATE)::date",
    end: 'CURRENT_DATE::date'
  };
};

const getEmployeeReport = async (companyId, userId, period = 'week') => {
  const selected = periodSql(period);

  const attendanceResult = await db.query(
    `WITH bounds AS (
       SELECT ${selected.start} AS start_date, ${selected.end} AS end_date
     )
     SELECT
       ar.check_in_time::date AS date,
       ar.check_in_time,
       ar.check_out_time,
       ar.duration_minutes,
       ar.status,
       ar.notes
     FROM attendance_records ar, bounds
     WHERE ar.company_id = $1
       AND ar.user_id = $2
       AND ar.check_in_time::date BETWEEN bounds.start_date AND bounds.end_date
     ORDER BY ar.check_in_time DESC`,
    [companyId, userId]
  );

  const workResult = await db.query(
    `WITH bounds AS (
       SELECT ${selected.start} AS start_date, ${selected.end} AS end_date
     )
     SELECT title, description, time_spent_minutes, priority, status, created_at
     FROM work_items wi, bounds
     WHERE wi.company_id = $1
       AND wi.user_id = $2
       AND wi.created_at::date BETWEEN bounds.start_date AND bounds.end_date
     ORDER BY wi.created_at DESC`,
    [companyId, userId]
  );

  const attendanceSummary = await getUserAttendanceSummary(companyId, userId);
  const totalMinutes = workResult.rows.reduce((sum, item) => sum + Number(item.time_spent_minutes || 0), 0);
  const completedItems = workResult.rows.filter((item) => item.status === 'completed').length;

  return {
    period,
    period_label: selected.label,
    attendance_summary: attendanceSummary,
    metrics: {
      attendance_days: attendanceResult.rows.length,
      work_items: workResult.rows.length,
      completed_items: completedItems,
      work_minutes: totalMinutes
    },
    attendance: attendanceResult.rows,
    work_items: workResult.rows
  };
};

const employeeReportCsv = (report) => {
  const rows = [
    {
      section: 'Summary',
      date: report.period_label,
      title: 'Attendance Percentage',
      status: `${report.attendance_summary.attendance_percentage}%`,
      minutes: '',
      notes: `${report.attendance_summary.present_days}/${report.attendance_summary.expected_days} working days`
    },
    ...report.attendance.map((entry) => ({
      section: 'Attendance',
      date: entry.date,
      title: 'Check In',
      status: entry.status,
      minutes: entry.duration_minutes,
      notes: entry.notes
    })),
    ...report.work_items.map((item) => ({
      section: 'Work',
      date: item.created_at,
      title: item.title,
      status: item.status,
      minutes: item.time_spent_minutes,
      notes: item.description
    }))
  ];

  return toCsv([
    { key: 'section', label: 'Section' },
    { key: 'date', label: 'Date' },
    { key: 'title', label: 'Title' },
    { key: 'status', label: 'Status' },
    { key: 'minutes', label: 'Minutes' },
    { key: 'notes', label: 'Notes' }
  ], rows);
};

const adminAttendanceCsv = async (companyId) => {
  const summary = await getTeamAttendanceSummary(companyId);
  return toCsv([
    { key: 'name', label: 'Worker' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'department', label: 'Department' },
    { key: 'attendance_percentage', label: 'Attendance %' },
    { key: 'present_days', label: 'Present Days' },
    { key: 'expected_days', label: 'Expected Days' },
    { key: 'present_today', label: 'Present Today' },
    { key: 'current_work', label: 'Current Work' },
    { key: 'status', label: 'Status' }
  ], summary.team.map((member) => ({
    ...member,
    name: `${member.first_name || ''} ${member.last_name || ''}`.trim() || member.email,
    present_today: member.present_today ? 'Yes' : 'No',
    current_work: member.current_work_title || ''
  })));
};

const adminWorkCsv = async (companyId) => {
  const result = await db.query(
    `SELECT
       wi.created_at,
       u.email,
       u.first_name,
       u.last_name,
       wi.title,
       wi.description,
       wi.time_spent_minutes,
       wi.priority,
       wi.status
     FROM work_items wi
     JOIN users u ON u.id = wi.user_id
     WHERE wi.company_id = $1
     ORDER BY wi.created_at DESC`,
    [companyId]
  );

  return toCsv([
    { key: 'created_at', label: 'Date' },
    { key: 'name', label: 'Worker' },
    { key: 'email', label: 'Email' },
    { key: 'title', label: 'Title' },
    { key: 'description', label: 'Description' },
    { key: 'time_spent_minutes', label: 'Minutes' },
    { key: 'priority', label: 'Priority' },
    { key: 'status', label: 'Status' }
  ], result.rows.map((row) => ({
    ...row,
    name: `${row.first_name || ''} ${row.last_name || ''}`.trim() || row.email
  })));
};

module.exports = {
  adminAttendanceCsv,
  adminWorkCsv,
  employeeReportCsv,
  getEmployeeReport
};
