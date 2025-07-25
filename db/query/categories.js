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
