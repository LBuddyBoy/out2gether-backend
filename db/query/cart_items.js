import db from "#db/client";

const allowedFields = ["post_id", "owner_id", "quantity"];

export async function createCartItem({ post_id, owner_id, quantity }) {
  const SQL = `
  INSERT INTO cart_items(post_id, owner_id, quantity)
  VALUES($1, $2, $3)
  RETURNING *
  `;

  const { rows: cart_item } = await db.query(SQL, [
    post_id,
    owner_id,
    quantity,
  ]);

  return cart_item;
}

export async function updateCartItem(id, fields) {
  const updates = Object.entries(fields).filter(
    ([k, v]) => k != null && v != null && allowedFields.includes(k)
  );

  if (updates.length === 0) {
    throw new Error("There were no valid fields to update.");
  }

  const sets = updates.map(([k, v], index) => `${k} = $${index + 2}`);
  const values = updates.map(([_, v]) => v);
  const SQL = `
  UPDATE cart_items
  SET ${sets}
  WHERE id = $1
  RETURNING *
  `;

  const {
    rows: [cart_item],
  } = await db.query(SQL, [id, ...values]);

  return cart_item;
}
