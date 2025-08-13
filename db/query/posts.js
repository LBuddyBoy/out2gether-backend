import db from "#db/client";
import { PUBLIC_USER_RETURNS } from "#db/query/users";
import { isValid, isValidArray } from "#util/util";

const allowedFields = [
  "user_id",
  "category_id",
  "title",
  "body",
  "price",
  "date",
  "time",
  "image_url",
];

/**
 * Creates a new post
 *
 * @param {Object} params
 * @param {number} params.user_id
 * @param {number} params.category_id
 * @param {string} params.title
 * @param {string} params.body
 * @param {number} params.price
 * @param {string} params.date
 * @param {string} params.time
 * @param {string} params.image_url
 *
 * @returns {Promise<Object>} the post created
 */
export async function createPost({
  user_id,
  category_id,
  title,
  body,
  price,
  date,
  time,
  image_url,
}) {
  const SQL = `
    INSERT INTO posts
      (user_id, category_id, title, body, price, date, time, image_url)
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
    `;

  const {
    rows: [post],
  } = await db.query(SQL, [
    user_id,
    category_id,
    title,
    body,
    price,
    date,
    time,
    image_url,
  ]);

  return post;
}

/**
 * Finds a post by it's id
 *
 * @param {number} id the id of the post to query
 *
 * @returns {Promise<Object>} the post that was found
 */
export async function getPostById(id, viewerUserId) {
  const SQL = `
    SELECT 
      posts.*, 
      row_to_json(pl) AS location, 
      row_to_json(u) AS user
    FROM posts
    JOIN post_locations pl ON pl.post_id = posts.id
    JOIN (
      SELECT ${PUBLIC_USER_RETURNS} FROM users
    ) u ON u.id = posts.user_id
    WHERE posts.id = $1
  `;

  const {
    rows: [post],
  } = await db.query(SQL, [id]);

  return post;
}

/**
 * Updates a post based on the fields
 *
 * @param {number} id
 * @param {Object} fields
 *
 * @returns {Promise<Object>} the updated post
 */
export async function updatePost(id, fields) {
  const updates = Object.entries(fields).filter(
    ([k, v]) => k != null && v != null && allowedFields.includes(k)
  );

  if (updates.length === 0) {
    throw new Error("There were no valid fields to update.");
  }

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

/**
 * Deletes a post by the id
 *
 * @param {number} id
 *
 * @returns {Promise<Object|undefined>} returns an object if it's deleted undefined if there was an error.
 */
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
