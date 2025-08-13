import db from "#db/client";
import { PUBLIC_USER_RETURNS } from "#db/query/users";

export async function createFavoritePost({ user_id, post_id }) {
  const SQL = `
  INSERT INTO favorite_posts(user_id, post_id)
  VALUES($1, $2)
  RETURNING *
  `;

  const {
    rows: [favorite],
  } = await db.query(SQL, [user_id, post_id]);

  return favorite;
}

export async function getFavoritePost(userId, postId) {
  const SQL = `
  SELECT fp.*, row_to_json(posts) AS post, row_to_json(users) AS user
  FROM favorite_posts fp
  JOIN posts ON fp.post_id = posts.id
  JOIN (
    SELECT ${PUBLIC_USER_RETURNS}
    FROM users
  ) users ON users.id = fp.user_id
  WHERE fp.user_id = $1 AND fp.post_id = $2
  `;

  const {
    rows: [favorite],
  } = await db.query(SQL, [userId, postId]);

  return favorite;
}

export async function deleteFavoritePost(userId, postId) {
  const SQL = `
  DELETE FROM favorite_posts
  WHERE user_id = $1 AND post_id = $2
  RETURNING *
  `;

  const {
    rows: [favorite],
  } = await db.query(SQL, [userId, postId]);

  return favorite;
}

export async function getFavoritePosts(userId) {
  const SQL = `
  SELECT fp.*, row_to_json(posts) AS post, row_to_json(users) AS user
  FROM favorite_posts fp
  JOIN posts ON posts.id = fp.post_id
  JOIN (
    SELECT ${PUBLIC_USER_RETURNS}
    FROM users
  ) users ON users.id = fp.user_id
  WHERE fp.user_id = $1
  `;

  const { rows } = await db.query(SQL, [userId]);

  return rows;
}