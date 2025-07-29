import db from "#db/client";

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

export async function deleteFavoritePost(user_id, post_id) {
  const SQL = `
  DELETE FROM favorite_posts
  WHERE user_id = $1 AND post_id = $2
  RETURNING *
  `;

  const {
    rows: [favorite],
  } = await db.query(SQL, [user_id, post_id]);

  return favorite;
}

export async function getFavoritePosts(user_id) {
  const SQL = `
  SELECT fp.*, row_to_json(posts) AS post
  FROM favorite_posts fp
  JOIN posts ON posts.id = fp.post_id
  WHERE fp.user_id = $1
  `;

  const { rows } = await db.query(SQL, [user_id]);

  return rows;
}
