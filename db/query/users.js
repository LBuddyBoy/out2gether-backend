import db from "#db/client";

export const PUBLIC_USER_RETURNS = "id, username, email, avatar_url";

/**
 * Creates a new user
 *
 * @param {Object} params
 * @param {string} params.username
 * @param {string} params.email
 * @param {string} params.password
 * @param {number} params.geolocation_longitude the longitude of the user (e.g., -32.0715)
 * @param {number} params.geolocation_latitude the latitude of the user (e.g., 20.9511)
 *
 * @returns {Promise<Object>} The created user object (public fields only).
 */
export async function createUser({
  username,
  email,
  password,
  geolocation_longitude,
  geolocation_latitude,
  is_admin = false,
}) {
  const SQL = `
    INSERT INTO users(username, email, password, geolocation_longitude, geolocation_latitude, is_admin)
    VALUES($1, $2, crypt($3, gen_salt('bf')), $4, $5, $6)
    RETURNING ${PUBLIC_USER_RETURNS}
    `;

  const {
    rows: [user],
  } = await db.query(SQL, [
    username,
    email,
    password,
    geolocation_longitude,
    geolocation_latitude,
    is_admin,
  ]);

  return user;
}

/**
 * Finds a user based on their id
 *
 * @param {any} id the id of the user to query
 *
 * @returns {Promise<Object>} The found user object (public fields only).
 */
export async function getUserById(id) {
  const SQL = `
    SELECT ${PUBLIC_USER_RETURNS}
    FROM users
    WHERE id = $1
    `;

  const {
    rows: [user],
  } = await db.query(SQL, [id]);

  return user;
}

/**
 * Validates an account based on the email and password
 *
 * @param {Object} params
 * @param {string} params.email the email of the user
 * @param {string} params.password the plain password of the user
 *
 * @returns {Promise<Object>} The found user object.
 */
export async function validateAccount({ email, password }) {
  const SQL = `
    SELECT *
    FROM users
    WHERE email = $1 AND password = crypt($2, password)
    `;

  const {
    rows: [user],
  } = await db.query(SQL, [email, password]);

  return user;
}
