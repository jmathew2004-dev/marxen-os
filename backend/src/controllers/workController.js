const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

const getCategories = async (req, res, next) => {
  try {
    const companyId = req.user.company_id;

    const result = await db.query(
      `SELECT * FROM work_categories
       WHERE company_id = $1 AND is_active = true
       ORDER BY name`,
      [companyId]
    );

    res.json({ categories: result.rows });
  } catch (error) {
    next(error);
  }
};

const logWork = async (req, res, next) => {
  try {
    const { category_id, title, description, time_spent_minutes, priority, status, related_product } = req.body;
    const userId = req.user.id;
    const companyId = req.user.company_id;

    if (!title || !time_spent_minutes) {
      return res.status(400).json({ error: 'Title and time_spent_minutes required' });
    }

    const workId = uuidv4();
    const result = await db.query(
      `INSERT INTO work_items (id, company_id, category_id, user_id, title, description, time_spent_minutes, priority, status, related_product)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [workId, companyId, category_id || null, userId, title, description || null, time_spent_minutes, priority || 'medium', status || 'completed', related_product || null]
    );

    res.status(201).json({ message: 'Work logged', work_item: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

const getMyWork = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const limit = req.query.limit || 50;

    const result = await db.query(
      `SELECT wi.*, wc.name as category_name
       FROM work_items wi
       LEFT JOIN work_categories wc ON wi.category_id = wc.id
       WHERE wi.user_id = $1
       ORDER BY wi.created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    res.json({ work_items: result.rows });
  } catch (error) {
    next(error);
  }
};

const getTeamWork = async (req, res, next) => {
  try {
    const companyId = req.user.company_id;

    const result = await db.query(
      `SELECT wi.*, u.first_name, u.last_name, wc.name as category_name
       FROM work_items wi
       JOIN users u ON wi.user_id = u.id
       LEFT JOIN work_categories wc ON wi.category_id = wc.id
       WHERE wi.company_id = $1
       ORDER BY wi.created_at DESC`,
      [companyId]
    );

    res.json({ work_items: result.rows });
  } catch (error) {
    next(error);
  }
};

const updateWorkItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority } = req.body;

    const result = await db.query(
      `UPDATE work_items
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           priority = COALESCE($4, priority),
           updated_at = NOW()
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [title, description, status, priority, id, req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Work item not found' });
    }

    res.json({ message: 'Work item updated', work_item: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

const deleteWorkItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `DELETE FROM work_items WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Work item not found' });
    }

    res.json({ message: 'Work item deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  logWork,
  getMyWork,
  getTeamWork,
  updateWorkItem,
  deleteWorkItem
};
