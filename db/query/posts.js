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
 * @param {number} params.title
 * @param {number} params.body
 * @param {number} params.price
 * @param {number} params.date
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
 * Gets all posts
 *
 * @param {number} page the page currently on
 * @param {number} limit the limit to retrieve
 *
 * @returns {Promise<Object[]>} the posts found
 */
export async function getPosts(page, limit) {
  const offset = (page - 1) * limit;

  const SQL = `
    SELECT posts.*, row_to_json(post_locations) AS location
    FROM posts
    JOIN post_locations ON post_locations.post_id = posts.id
    ORDER BY (posts.id, posts.created_at) DESC
    OFFSET $1
    LIMIT $2
    `;

  const { rows } = await db.query(SQL, [offset, limit]);

  return rows;
}

/**
 * Gets all posts based on a query
 *
 * @param {number} query the keyword to search
 * @param {number} page the page currently on
 * @param {number} limit the limit to retrieve
 *
 * @returns {Promise<Object[]>} the posts found
 */
export async function searchPosts(query, page, limit) {
  const offset = (page - 1) * limit;

  const SQL = `
    SELECT posts.*, row_to_json(post_locations) AS location
    FROM posts
    JOIN post_locations ON post_locations.post_id = posts.id
    WHERE posts.title ILIKE $3 OR posts.body ILIKE $3
    ORDER BY (posts.id, posts.created_at) DESC
    OFFSET $1
    LIMIT $2
    `;

  const { rows } = await db.query(SQL, [offset, limit, `%${query}%`]);

  return rows;
}

/**
 * Finds a post by it's id
 *
 * @param {number} id the id of the post to query
 *
 * @returns {Promise<Object>} the post that was found
 */
export async function getPostById(id) {
  const SQL = `
  SELECT posts.*, row_to_json(post_locations) AS location, row_to_json(users) AS user
  FROM posts
  JOIN post_locations ON post_locations.post_id = $1
  JOIN (
    SELECT ${PUBLIC_USER_RETURNS} FROM users
  ) users ON users.id = posts.user_id
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

/**
 * Fetches a paginated array of posts by a user
 *
 * @param {number} userId
 * @param {number} page
 * @param {number} limit
 * @returns an array of posts posted by a user
 */
export async function getPostsByUserId(userId, page, limit) {
  const offset = (page - 1) * limit;
  const SQL = `
  SELECT posts.*, row_to_json(users) AS user
  FROM posts
  JOIN (
    SELECT ${PUBLIC_USER_RETURNS}
    FROM users
  ) users ON users.id = $1
  WHERE posts.user_id = $1
  ORDER BY posts.id
  OFFSET $2
  LIMIT $3
  `;

  const { rows } = await db.query(SQL, [userId, offset, limit]);

  return rows;
}
