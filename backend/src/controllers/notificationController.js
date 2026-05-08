const db = require('../config/database');

const listNotifications = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit || 20), 50);

    const result = await db.query(
      `SELECT id, type, severity, title, message, metadata, read_at, created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [req.user.id, limit]
    );

    const unreadResult = await db.query(
      `SELECT COUNT(*)::int AS unread_count
       FROM notifications
       WHERE user_id = $1 AND read_at IS NULL`,
      [req.user.id]
    );

    res.json({
      notifications: result.rows,
      unread_count: unreadResult.rows[0]?.unread_count || 0
    });
  } catch (error) {
    next(error);
  }
};

const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `UPDATE notifications
       SET read_at = COALESCE(read_at, NOW())
       WHERE id = $1 AND user_id = $2
       RETURNING id, read_at`,
      [id, req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ notification: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

const markAllNotificationsRead = async (req, res, next) => {
  try {
    await db.query(
      `UPDATE notifications
       SET read_at = COALESCE(read_at, NOW())
       WHERE user_id = $1 AND read_at IS NULL`,
      [req.user.id]
    );

    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead
};
