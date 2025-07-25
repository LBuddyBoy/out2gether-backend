import db from "#db/client";

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
