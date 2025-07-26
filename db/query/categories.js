import db from "#db/client";

/**
 * Creates a new category for filtering
 *
 * @param {Object} params
 * @param {string} params.name
 * @param {string} params.description
 *
 * @returns {Promise<Object>} the created category
 */
export async function createCategory({ name, description }) {
  const SQL = `
  INSERT INTO categories
    (name, description)
  VALUES
    ($1, $2)
  RETURNING *
  `;

  const {
    rows: [category],
  } = await db.query(SQL, [name, description]);

  return category;
}

/**
 * Gets all categories
 * 
 * @returns an array of categories
 */
export async function getCategories() {
  const SQL = `
  SELECT * FROM categories
  `;

  const { rows } = await db.query(SQL);

  return rows;
}

/**
 * Gets a category by the id
 * 
 * @param {number} id 
 * @returns the category found
 */
export async function getCategoryById(id) {
  const SQL = `
  SELECT *
  FROM categories
  WHERE id = $1
  `;

  const {
    rows: [category],
  } = await db.query(SQL, [id]);

  return category;
}

/**
 * Gets all posts from a category with pagination
 * 
 * @param {Object} params
 * @param {number} params.id 
 * @param {number} params.page 
 * @param {number} params.limit 
 * @returns an array of posts found
 */
export async function getCategoryPosts({id, page, limit}) {
  const offset = (page - 1) * limit;
  const SQL = `
  SELECT posts.*, row_to_json(post_locations) AS location
  FROM posts
  JOIN post_locations ON post_locations.post_id = posts.id
  WHERE posts.category_id = $1
  ORDER BY (posts.id, posts.created_at) DESC
  OFFSET $2
  LIMIT $3
  `;

  const { rows } = await db.query(SQL, [id, offset, limit]);

  return rows;
}
