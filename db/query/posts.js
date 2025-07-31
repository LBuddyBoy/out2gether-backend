import db from "#db/client";

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
  SELECT posts.*, row_to_json(post_locations) AS location
  FROM posts
  JOIN post_locations ON post_locations.post_id = $1
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
 * Gets all posts within a certain radius of the origin
 *
 * @param {Object} params
 * @param {number} params.geolocation_latitude
 * @param {number} params.geolocation_longitude
 * @param {number} params.miles
 * @param {number} params.page
 * @param {number} params.limit
 * @returns an array of posts with their distance from the origin
 */
export async function getPostsNear({
  geolocation_latitude,
  geolocation_longitude,
  miles,
  page,
  limit,
}) {
  const offset = (page - 1) * limit;
  const meters = miles * 1609.34;
  const SQL = `
  SELECT posts.*, row_to_json(post_locations) AS location
  FROM posts
  JOIN (
    SELECT pl.*, earth_distance(ll_to_earth(pl.geolocation_latitude, pl.geolocation_longitude), ll_to_earth($1, $2)) AS distance_meters
    FROM post_locations pl
  ) post_locations ON post_locations.post_id = posts.id AND post_locations.distance_meters < $3
  ORDER BY post_locations.distance_meters ASC
  OFFSET $4
  LIMIT $5
  `;

  const { rows } = await db.query(SQL, [
    geolocation_latitude,
    geolocation_longitude,
    meters,
    offset,
    limit,
  ]);

  return rows;
}

export async function getPostsByField(field, minimum, maximum, page, limit) {
  if (!allowedFields.includes(field)) {
    throw new Error("That field queried is not valid.");
  }

  const offset = (page - 1) * limit;
  const SQL = `
  SELECT * 
  FROM posts
  WHERE posts.${field} >= $1 AND posts.${field} <= $2
  ORDER BY posts.${field}
  OFFSET $3
  LIMIT $4
  `;

  const { rows } = await db.query(SQL, [minimum, maximum, offset, limit]);

  return rows;
}
