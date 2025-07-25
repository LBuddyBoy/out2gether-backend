import db from "#db/client";

const allowedFields = [
  "post_id",
  "address",
  "country",
  "state",
  "city",
  "zip_code",
  "geolocation_longitude",
  "geolocation_latitude",
];

/**
 * Creates the post location information
 *
 * @param {Object} params
 * @param {number} params.post_id
 * @param {string} params.address
 * @param {string} params.country
 * @param {string} params.state
 * @param {string} params.city
 * @param {text} params.zip_code
 * @param {number} params.geolocation_longitude (e.g., -32.0715)
 * @param {number} params.geolocation_latitude (e.g., 55.3215)
 *
 * @returns {Promise<Object>} the created post location
 */
export async function createPostLocation({
  post_id,
  address,
  country,
  state,
  city,
  zip_code,
  geolocation_longitude,
  geolocation_latitude,
}) {
  const SQL = `
    INSERT INTO post_locations
      (post_id, address, country, state, city, zip_code, geolocation_longitude, geolocation_latitude)
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
    geolocation_longitude,
    geolocation_latitude,
  ]);

  return post_location;
}

/**
 * Updates a post location based on the fields
 *
 * @param {number} id
 * @param {Object} fields
 * 
 * @returns {Promise<Object>} the updated post location
 */
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
