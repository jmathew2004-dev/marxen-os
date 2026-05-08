const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const config = require('../config/env');

const ADMIN_ROLES = ['owner', 'admin'];
const WORKER_ROLES = ['employee', 'manager'];

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, company_id: user.company_id },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

const publicUser = (user) => ({
  id: user.id,
  email: user.email,
  first_name: user.first_name,
  last_name: user.last_name,
  role: user.role,
  company_id: user.company_id
});

const respondWithSession = (res, user, status = 200) => {
  const token = generateToken(user);
  res.status(status).json({ token, user: publicUser(user) });
};

const ownerRegister = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { password, first_name, last_name, company_name } = req.body;

    if (!email || !password || !company_name) {
      return res.status(400).json({ error: 'Email, password, and company name required' });
    }

    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const existingUser = await client.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email]);
      if (existingUser.rows.length) {
        await client.query('ROLLBACK');
        return res.status(409).json({ error: 'Email already exists' });
      }

      const companyResult = await client.query(
        `INSERT INTO companies (id, name, description)
         VALUES ($1, $2, $3)
         RETURNING id, name`,
        [uuidv4(), company_name, null]
      );
      const companyId = companyResult.rows[0].id;
      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await client.query(
        `INSERT INTO users (id, email, password_hash, first_name, last_name, company_id, role)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, email, first_name, last_name, role, company_id`,
        [uuidv4(), email, hashedPassword, first_name || null, last_name || null, companyId, 'owner']
      );

      await client.query('COMMIT');
      respondWithSession(res, result.rows[0], 201);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

const workerRegister = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { password, first_name, last_name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const whitelistResult = await client.query(
        `SELECT *
         FROM worker_email_whitelist
         WHERE LOWER(email) = LOWER($1)
           AND used_at IS NULL
         LIMIT 1`,
        [email]
      );

      if (!whitelistResult.rows.length) {
        await client.query('ROLLBACK');
        return res.status(403).json({ error: 'This email is not whitelisted for worker access' });
      }

      const existingUser = await client.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email]);
      if (existingUser.rows.length) {
        await client.query('ROLLBACK');
        return res.status(409).json({ error: 'Email already exists' });
      }

      const invite = whitelistResult.rows[0];
      const role = WORKER_ROLES.includes(invite.role) ? invite.role : 'employee';
      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await client.query(
        `INSERT INTO users (
           id, company_id, email, password_hash, first_name, last_name,
           role, department, designation
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, email, first_name, last_name, role, company_id`,
        [
          uuidv4(),
          invite.company_id,
          email,
          hashedPassword,
          first_name || invite.first_name || null,
          last_name || invite.last_name || null,
          role,
          invite.department || null,
          invite.designation || null
        ]
      );

      await client.query(
        `UPDATE worker_email_whitelist
         SET used_at = NOW(), updated_at = NOW()
         WHERE id = $1`,
        [invite.id]
      );

      await client.query('COMMIT');
      respondWithSession(res, result.rows[0], 201);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    next(error);
  }
};

const register = (req, res, next) => {
  return workerRegister(req, res, next);
};

const loginWithRoles = (allowedRoles) => async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const result = await db.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    const user = result.rows[0];

    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (allowedRoles.length && !allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: 'This login is not available for your account type' });
    }

    respondWithSession(res, user);
  } catch (error) {
    next(error);
  }
};

const workerLogin = loginWithRoles(WORKER_ROLES);
const adminLogin = loginWithRoles(ADMIN_ROLES);

const login = (req, res, next) => {
  if (req.body.account_type === 'worker') {
    return workerLogin(req, res, next);
  }

  if (req.body.account_type === 'admin') {
    return adminLogin(req, res, next);
  }

  return res.status(400).json({ error: 'Use worker or admin login' });
};

const logout = (req, res) => {
  res.json({ message: 'Logout successful' });
};

module.exports = {
  register,
  ownerRegister,
  workerRegister,
  login,
  workerLogin,
  adminLogin,
  logout,
  generateToken
};
