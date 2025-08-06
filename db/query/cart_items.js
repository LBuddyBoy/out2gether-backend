import db from "#db/client";

const allowedFields = ["post_id", "owner_id", "quantity"];

/**
 * Creates a new cart item
 *
 * @param {Object} params
 * @param {number} params.post_id
 * @param {number} params.owner_id
 * @param {number} params.quantity
 *
 * @returns {Promise<Object>} the cart item created
 */
export async function createCartItem({ post_id, owner_id, quantity = 1 }) {
  const SQL = `
  INSERT INTO cart_items(post_id, owner_id, quantity)
  VALUES($1, $2, $3)
  RETURNING *;
  `;

  const { rows: cart_item } = await db.query(SQL, [
    post_id,
    owner_id,
    quantity,
  ]);

  return cart_item;
}

/**
 * Deletes a cart item
 * 
 * @param {number} userId 
 * @param {number} postId 
 * @returns {Promise<Object|undefined>} returns an object if it's deleted undefined if there was an error.
 */
export async function deleteCartItem(userId, postId) {
  const SQL = `
  DELETE FROM cart_items
  WHERE owner_id = $1 AND post_id = $2
  RETURNING *
  `;

  const {
    rows: [cart_item],
  } = await db.query(SQL, [userId, postId]);

  return cart_item;
}

/**
 * Fetches all of the posts in a users cart
 * 
 * @param {number} userId 
 * @returns an array of cart item objects
 */
export async function getCartItems(userId) {
  const SQL = `
  SELECT ci.*, row_to_json(posts) AS post
  FROM cart_items ci
  JOIN posts ON posts.id = ci.post_id
  WHERE ci.owner_id = $1
  `;

  const { rows } = await db.query(SQL, [userId]);

  return rows;
}

/**
 * Gets a cart item based on the user and post id
 * 
 * @param {number} userId 
 * @param {number} postId 
 * @returns a cart item object
 */
export async function getCartItem(userId, postId) {
  const SQL = `
  SELECT ci.*, row_to_json(posts) AS post
  FROM cart_items ci
  JOIN posts ON posts.id = ci.post_id
  WHERE ci.owner_id = $1 AND ci.post_id = $2
  `;

  const {
    rows: [cart_item],
  } = await db.query(SQL, [userId, postId]);

  return cart_item;
}

/**
 * Updates a cart item based on the fields
 *
 * @param {number} id
 * @param {Object} fields
 *
 * @returns {Promise<Object>} the updated cart item
 */
export async function updateCartItem(userId, postId, fields) {
  const updates = Object.entries(fields).filter(
    ([k, v]) => k != null && v != null && allowedFields.includes(k)
  );

  if (updates.length === 0) {
    throw new Error("There were no valid fields to update.");
  }

  const sets = updates.map(([k, _], index) => `${k} = $${index + 3}`);
  const values = updates.map(([_, v]) => v);
  const SQL = `
  UPDATE cart_items
  SET ${sets}
  WHERE owner_id = $1 AND post_id = $2
  RETURNING *
  `;

  const {
    rows: [cart_item],
  } = await db.query(SQL, [userId, postId, ...values]);

  return cart_item;
}
