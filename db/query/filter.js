import db from "#db/client";
import { isValid, isValidArray } from "#util/util";
import { PUBLIC_USER_RETURNS } from "#db/query/users";

const allowedFields = [
  "category_ids",
  "min_price",
  "max_price",
  "min_date",
  "max_date",
  "geolocation_latitude",
  "geolocation_longitude",
  "distance_miles",
];

export async function createFilter({ user_id }) {
  const SQL = `
    INSERT INTO filters (user_id)
    VALUES ($1)
    RETURNING *
    `;

  const { rows: filter } = await db.query(SQL, [user_id]);

  return filter;
}

export async function getFilterByUserId(userId) {
  const SQL = `
    SELECT *
    FROM filters
    WHERE user_id = $1
`;
  const {
    rows: [filter],
  } = await db.query(SQL, [userId]);

  return filter;
}

/**
 * Updates a filter based on the fields
 *
 * @param {number} id
 * @param {Object} fields
 *
 * @returns {Promise<Object>} the updated filter
 */
export async function updateFilter(userId, fields) {
  const updates = Object.entries(fields).filter(
    ([k, v]) => k != null && allowedFields.includes(k)
  );

  if (updates.length === 0) {
    throw new Error("There were no valid fields to update.");
  }

  const sets = updates.map(([k, _], index) => `${k} = $${index + 2}`);
  const values = updates.map(([_, v]) => v);

  const SQL = `
  UPDATE filters
  SET ${sets}
  WHERE user_id = $1
  RETURNING *
  `;

  const {
    rows: [filter],
  } = await db.query(SQL, [userId, ...values]);

  return filter;
}

export async function getFilteredPosts({
  min_date,
  max_date,
  min_price,
  max_price,
  category_ids,
  geolocation_latitude,
  geolocation_longitude,
  distance_miles,
  userId, // filter by posts from a specific user
  searchQuery,
  page,
  limit,
  favoritesOnly,
}) {
  const offset = (page - 1) * limit;
  const params = [offset, limit]; // Initialize params with guaranteed values to maintain placeholders for $1, $2
  const orderClause = "posts.created_at DESC";

  const selectStatements = [
    "posts.*",
    "row_to_json(users) as user",
    "row_to_json(pl) AS location",
  ];
  const whereClauses = [];
  const joinClauses = [
    "JOIN post_locations pl ON pl.post_id = posts.id",
    `JOIN (SELECT ${PUBLIC_USER_RETURNS} FROM users) users ON users.id = posts.user_id`,
  ];

  if (isValidArray([min_date, max_date])) {
    const minIndex = params.length + 1;
    const maxIndex = params.length + 2;

    whereClauses.push(
      `(posts.date >= $${minIndex} AND posts.date <= $${maxIndex})`
    );
    params.push(min_date, max_date);
  }

  if (isValidArray([min_price, max_price]) && min_price >= 0 && max_price > 0) {
    const minIndex = params.length + 1;
    const maxIndex = params.length + 2;
    whereClauses.push(
      `(posts.price >= $${minIndex} AND posts.price <= $${maxIndex})`
    );
    params.push(min_price, max_price);
  }

  if (isValid(searchQuery)) {
    whereClauses.push(
      `(posts.title ILIKE $${params.length + 1} OR posts.body ILIKE $${
        params.length + 1
      })`
    );
    params.push(`%${searchQuery}%`);
  }

  if (isValid(userId)) {
    whereClauses.push(`posts.user_id = $${params.length + 1}`);
    params.push(userId);
  }

  if (isValidArray([geolocation_latitude, geolocation_longitude])) {
    const miles = distance_miles || 20;
    const meters = miles * 1609.34;
    const latIndex = params.length + 1;
    const longIndex = params.length + 2;
    const distIndex = params.length + 3;

    whereClauses.push(
      `earth_distance(ll_to_earth(pl.geolocation_latitude, pl.geolocation_longitude), ll_to_earth($${latIndex}, $${longIndex})) < $${distIndex}`
    );

    params.push(geolocation_latitude, geolocation_longitude, meters);
  }

  if (isValid(category_ids) && category_ids.length > 0) {
    const categoryClauses = [];
    for (const categoryId of category_ids) {
      categoryClauses.push(`posts.category_id = $${params.length + 1}`);
      params.push(categoryId);
    }
    whereClauses.push(`(${categoryClauses.join(" OR ")})`);
  }

  if (favoritesOnly && isValid(userId)) {
    joinClauses.push("JOIN favorite_posts f ON f.post_id = posts.id");
    whereClauses.push(`f.user_id = $${params.length + 1}`);
    params.push(userId);
  }

  const SQL = `
    SELECT ${selectStatements.join(", ")}
    FROM posts
    ${joinClauses.join(" ")}
    ${whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : ""}
    ORDER BY ${orderClause}
    OFFSET $1
    LIMIT $2
  `;

  // console.log("Params: ", params);
  // console.log("SQL: ", SQL);

  const { rows } = await db.query(SQL, params);
  return rows;
}
