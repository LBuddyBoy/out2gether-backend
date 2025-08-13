import db from "#db/client";

export async function createNotification({
  user_id,
  message,
  duration = 5000,
}) {
  const SQL = `
  INSERT INTO notifications (user_id, message, duration)
  VALUES ($1, $2, $3)
  RETURNING *
  `;

  const {
    rows: [notification],
  } = await db.query(SQL, [user_id, message, duration]);

  return notification;
}

export async function getNotificationsAmountByUserId(userId) {
  const SQL = `
  SELECT COUNT(*)
  FROM notifications
  WHERE user_id = $1 AND is_read = false
  `;

  const { rows: [count] } = await db.query(SQL, [userId]);

  return count;
}

export async function getNotificationsByUserId(
  userId,
  { page = 1, limit = 10, onlyUnread = false }
) {
  const offset = (page - 1) * limit;
  const SQL = `
  SELECT *
  FROM notifications
  WHERE user_id = $1 AND is_read = $2
  ORDER BY created_at DESC
  OFFSET $3
  LIMIT $4
  `;

  const { rows } = await db.query(SQL, [userId, onlyUnread, offset, limit]);

  return rows;
}

export async function getNotificationById(id) {
  const SQL = `
  SELECT *
  FROM notifications
  WHERE id = $1
  ORDER BY created_at DESC
  `;

  const {
    rows: [notification],
  } = await db.query(SQL, [id]);

  return notification;
}

export async function markNotificationAsRead(notificationId) {
  const SQL = `
  UPDATE notifications
  SET is_read = true
  WHERE id = $1
  RETURNING *
  `;

  const {
    rows: [notification],
  } = await db.query(SQL, [notificationId]);

  return notification;
}

export async function deleteNotification(notificationId) {
  const SQL = `
  DELETE FROM notifications
  WHERE id = $1
  RETURNING *
  `;

  const {
    rows: [notification],
  } = await db.query(SQL, [notificationId]);

  return notification;
}
