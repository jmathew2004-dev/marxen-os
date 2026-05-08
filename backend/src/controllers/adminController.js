const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const db = require('../config/database');
const { adminAttendanceCsv, adminWorkCsv } = require('../services/reporting');

const WORKER_ROLES = ['employee', 'manager'];
const TEAM_ROLES = ['employee', 'manager', 'admin', 'owner'];

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const validateTeamRole = (role, currentUserRole) => {
  const requestedRole = role || 'employee';

  if (!TEAM_ROLES.includes(requestedRole)) {
    return { error: 'Role must be employee, manager, admin, or owner' };
  }

  if (requestedRole === 'owner' && currentUserRole !== 'owner') {
    return { error: 'Only an owner can create or promote another owner' };
  }

  return { role: requestedRole };
};

const activeOwnerCount = async (companyId) => {
  const result = await db.query(
    `SELECT COUNT(*)::int AS count
     FROM users
     WHERE company_id = $1 AND role = 'owner' AND is_active = true`,
    [companyId]
  );
  return result.rows[0]?.count || 0;
};

const setupCompany = async (req, res, next) => {
  try {
    const { name, description, logo_url } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Company name required' });
    }

    const companyId = uuidv4();
    const result = await db.query(
      `INSERT INTO companies (id, name, description, logo_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [companyId, name, description || null, logo_url || null]
    );

    res.status(201).json({ message: 'Company created', company: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

const updateCompany = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, logo_url } = req.body;

    const result = await db.query(
      `UPDATE companies
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           logo_url = COALESCE($3, logo_url),
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [name, description, logo_url, id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json({ message: 'Company updated', company: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

const addTeamMember = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { first_name, last_name, role, department, designation } = req.body;
    const companyId = req.user.company_id;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    const roleResult = validateTeamRole(role, req.user.role);
    if (roleResult.error) {
      return res.status(403).json({ error: roleResult.error });
    }

    // Generate a temporary password (should be changed by user on first login)
    const tempPassword = uuidv4().substring(0, 12);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const userId = uuidv4();
    const result = await db.query(
      `INSERT INTO users (id, company_id, email, password_hash, first_name, last_name, role, department, designation)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, email, first_name, last_name, role`,
      [
        userId,
        companyId,
        email,
        hashedPassword,
        first_name || null,
        last_name || null,
        roleResult.role,
        department || null,
        designation || null
      ]
    );

    res.status(201).json({
      message: 'Team member added',
      user: result.rows[0],
      temporary_password: tempPassword // In production, send via email
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    next(error);
  }
};

const addWorkerWhitelist = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { first_name, last_name, role, department, designation } = req.body;
    const companyId = req.user.company_id;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    if (role && !WORKER_ROLES.includes(role)) {
      return res.status(400).json({ error: 'Worker whitelist role must be employee or manager' });
    }

    const existingUser = await db.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    if (existingUser.rows.length) {
      return res.status(409).json({ error: 'A user with this email already exists' });
    }

    const existingInvite = await db.query(
      'SELECT id, company_id FROM worker_email_whitelist WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    if (existingInvite.rows.length && existingInvite.rows[0].company_id !== companyId) {
      return res.status(409).json({ error: 'This email is already whitelisted by another company' });
    }

    let result;
    if (existingInvite.rows.length) {
      result = await db.query(
        `UPDATE worker_email_whitelist
         SET first_name = $1,
             last_name = $2,
             role = $3,
             department = $4,
             designation = $5,
             invited_by = $6,
             used_at = NULL,
             updated_at = NOW()
         WHERE id = $7 AND company_id = $8
         RETURNING *`,
        [
          first_name || null,
          last_name || null,
          role || 'employee',
          department || null,
          designation || null,
          req.user.id,
          existingInvite.rows[0].id,
          companyId
        ]
      );
    } else {
      result = await db.query(
        `INSERT INTO worker_email_whitelist (
           id, company_id, email, first_name, last_name, role,
           department, designation, invited_by
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          uuidv4(),
          companyId,
          email,
          first_name || null,
          last_name || null,
          role || 'employee',
          department || null,
          designation || null,
          req.user.id
        ]
      );
    }

    res.status(201).json({ message: 'Worker email whitelisted', whitelist_entry: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Email already whitelisted' });
    }
    next(error);
  }
};

const listWorkerWhitelist = async (req, res, next) => {
  try {
    const companyId = req.user.company_id;

    const result = await db.query(
      `SELECT id, email, first_name, last_name, role, department, designation,
              used_at, created_at, updated_at
       FROM worker_email_whitelist
       WHERE company_id = $1
       ORDER BY created_at DESC`,
      [companyId]
    );

    res.json({ whitelist: result.rows });
  } catch (error) {
    next(error);
  }
};

const removeWorkerWhitelist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.company_id;

    const result = await db.query(
      `DELETE FROM worker_email_whitelist
       WHERE id = $1 AND company_id = $2 AND used_at IS NULL
       RETURNING id`,
      [id, companyId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Whitelist entry not found or already used' });
    }

    res.json({ message: 'Whitelist entry removed' });
  } catch (error) {
    next(error);
  }
};

const listTeamMembers = async (req, res, next) => {
  try {
    const companyId = req.user.company_id;

    const result = await db.query(
      `SELECT id, email, first_name, last_name, role, department, designation, is_active
       FROM users
       WHERE company_id = $1
       ORDER BY first_name`,
      [companyId]
    );

    res.json({ team_members: result.rows });
  } catch (error) {
    next(error);
  }
};

const updateTeamMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, role, department, designation, is_active } = req.body;
    const companyId = req.user.company_id;

    if (role) {
      const roleResult = validateTeamRole(role, req.user.role);
      if (roleResult.error) {
        return res.status(403).json({ error: roleResult.error });
      }
    }

    const existingUser = await db.query(
      'SELECT id, role, is_active FROM users WHERE id = $1 AND company_id = $2',
      [id, companyId]
    );

    if (!existingUser.rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    const targetUser = existingUser.rows[0];
    const wouldRemoveOwnerAccess = targetUser.role === 'owner' && (
      (role && role !== 'owner') ||
      is_active === false
    );

    if (wouldRemoveOwnerAccess && await activeOwnerCount(companyId) <= 1) {
      return res.status(400).json({ error: 'At least one active owner account is required' });
    }

    const result = await db.query(
      `UPDATE users
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           role = COALESCE($3, role),
           department = COALESCE($4, department),
           designation = COALESCE($5, designation),
           is_active = COALESCE($6, is_active),
           updated_at = NOW()
       WHERE id = $7 AND company_id = $8
       RETURNING id, email, first_name, last_name, role`,
      [first_name, last_name, role, department, designation, is_active, id, companyId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Team member updated', user: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

const removeTeamMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.company_id;

    if (id === req.user.id) {
      return res.status(400).json({ error: 'You cannot remove your own account' });
    }

    const existingUser = await db.query(
      'SELECT id, role FROM users WHERE id = $1 AND company_id = $2',
      [id, companyId]
    );

    if (!existingUser.rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (existingUser.rows[0].role === 'owner' && await activeOwnerCount(companyId) <= 1) {
      return res.status(400).json({ error: 'At least one active owner account is required' });
    }

    const result = await db.query(
      `DELETE FROM users WHERE id = $1 AND company_id = $2 RETURNING id`,
      [id, companyId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Team member removed' });
  } catch (error) {
    next(error);
  }
};

const downloadAttendanceReport = async (req, res, next) => {
  try {
    const csv = await adminAttendanceCsv(req.user.company_id);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="marxen-attendance-report.csv"');
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

const downloadWorkReport = async (req, res, next) => {
  try {
    const csv = await adminWorkCsv(req.user.company_id);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="marxen-work-report.csv"');
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  setupCompany,
  updateCompany,
  addTeamMember,
  addWorkerWhitelist,
  listWorkerWhitelist,
  removeWorkerWhitelist,
  listTeamMembers,
  updateTeamMember,
  removeTeamMember,
  downloadAttendanceReport,
  downloadWorkReport
};
