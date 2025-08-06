import db from "#db/client";

const allowedFields = ["post_id", "owner_id", "quantity"];

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

export async function getCartItems(user_id) {
  const SQL = `
  SELECT ci.*, row_to_json(posts) AS post
  FROM cart_items ci
  JOIN posts ON posts.id = ci.post_id
  WHERE ci.owner_id = $1
  `;

  const { rows } = await db.query(SQL, [user_id]);

  return rows;
}

export async function getCartItem(user_id, post_id) {
  const SQL = `
  SELECT ci.*, row_to_json(posts) AS post
  FROM cart_items ci
  JOIN posts ON posts.id = ci.post_id
  WHERE ci.owner_id = $1 AND ci.post_id = $2
  `;

  const {
    rows: [cart_item],
  } = await db.query(SQL, [user_id, post_id]);

  return cart_item;
}

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
