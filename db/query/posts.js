import db from "#db/client";

const allowedFields = [
  "user_id",
  "category_id",
  "title",
  "body",
  "price",
  "date",
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
}) {
  const SQL = `
    INSERT INTO posts
      (user_id, category_id, title, body, price, date)
    VALUES
      ($1, $2, $3, $4, $5, $6)
    RETURNING *
    `;

  const {
    rows: [post],
  } = await db.query(SQL, [user_id, category_id, title, body, price, date]);

  return post;
}

/**
 * Gets all posts
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
    OFFSET ${offset}
    LIMIT ${limit}
    `;

  const { rows } = await db.query(SQL);

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
  SELECT *
  FROM posts
  WHERE id = $1
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
