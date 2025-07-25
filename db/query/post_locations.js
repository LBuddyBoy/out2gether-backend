import db from "#db/client";

const allowedFields = [
  "post_id",
  "address",
  "country",
  "state",
  "city",
  "zip_code",
  "geolocation_latitude",
  "geolocation_longitude",
];

export async function createPostLocation({
  post_id,
  address,
  country,
  state,
  city,
  zip_code,
  geolocation_latitude,
  geolocation_longitude,
}) {
  const SQL = `
    INSERT INTO post_locations
      (post_id, address, country, state, city, zip_code, geolocation_latitude, geolocation_longitude)
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
   `;

  const {
    rows: [post_location],
  } = await db.query(SQL, [
    post_id,
    address,
    country,
    state,
    city,
    zip_code,
    geolocation_latitude,
    geolocation_longitude,
  ]);

  return post_location;
}

export async function updatePostLocation(id, fields) {
  const updates = Object.entries(fields).filter(
    ([k, v]) => k && v && allowedFields.includes(k)
  );
  const sets = updates.map(([k, v], index) => `${k} = $${index + 2}`);
  const values = updates.map(([_, v]) => v);

  const SQL = `
  UPDATE post_locations
  SET ${sets.join(", ")}
  WHERE post_id = $1
  RETURNING *
  `;

  const {
    rows: [post_location],
  } = await db.query(SQL, [id, ...values]);

  return post_location;
}
