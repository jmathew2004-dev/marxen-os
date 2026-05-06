const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

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
    const { email, first_name, last_name, role, department, designation } = req.body;
    const companyId = req.user.company_id;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    // Generate a temporary password (should be changed by user on first login)
    const tempPassword = uuidv4().substring(0, 12);
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const userId = uuidv4();
    const result = await db.query(
      `INSERT INTO users (id, company_id, email, password_hash, first_name, last_name, role, department, designation)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, email, first_name, last_name, role`,
      [userId, companyId, email, hashedPassword, first_name || null, last_name || null, role || 'employee', department || null, designation || null]
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

module.exports = {
  setupCompany,
  updateCompany,
  addTeamMember,
  listTeamMembers,
  updateTeamMember,
  removeTeamMember
};
