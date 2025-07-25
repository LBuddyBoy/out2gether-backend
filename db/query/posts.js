import db from "#db/client";

const allowedFields = ["user_id", "title", "body", "price", "date"];

export async function createPost({ user_id, title, body, price, date }) {
  const SQL = `
    INSERT INTO posts
      (user_id, title, body, price, date)
    VALUES
      ($1, $2, $3, $4, $5)
    RETURNING *
    `;

  const {
    rows: [post],
  } = await db.query(SQL, [user_id, title, body, price, date]);

  return post;
}

export async function getAllPosts() {
  const SQL = `
    SELECT posts.*, row_to_json(post_locations) AS location
    FROM posts
    JOIN post_locations ON post_locations.post_id = posts.id
    `;

  const { rows } = await db.query(SQL);

  return rows;
}

export async function getPostById(id) {
  const SQL = `
  SELECT *
  FROM posts
  WHERE id = $1
  `;

  const {
    rows: [post],
  } = await db.query(SQL, [id]);

  return post;
}

export async function updatePost(id, fields) {
  const updates = Object.entries(fields).filter(
    ([k, v]) => k != null && v != null && allowedFields.includes(k)
  );
  const sets = updates.map(([key], index) => `${key} = $${index + 2}`);
  const values = updates.map(([_, value]) => value);

  const SQL = `
  UPDATE posts
  SET ${sets.join(", ")}
  WHERE id = $1
  RETURNING *
  `;

  const {
    rows: [post],
  } = await db.query(SQL, [id, ...values]);

  return post;
}

export async function deletePostById(id) {
  const SQL = `
    DELETE FROM posts
    WHERE id = $1
    RETURNING *
    `;

  const {
    rows: [post],
  } = await db.query(SQL, [id]);

  return post;
}
