import db from "#db/client";
import { isValid, isValidArray } from "#util/util";

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
  userId,
  searchQuery,
  page,
  limit,
}) {
  console.log("getFilteredPosts variables:", {
    min_date,
    max_date,
    min_price,
    max_price,
    category_ids,
    geolocation_latitude,
    geolocation_longitude,
    distance_miles,
    userId,
    searchQuery,
    page,
    limit,
  });

  const offset = (page - 1) * limit;

  const params = [];
  let paramIndex = 1;

  const selectStatements = [
    "posts.*",
    "row_to_json(u) as user",
    "row_to_json(pl) AS location",
  ];
  const whereClauses = [];
  const orderClauses = ["posts.created_at DESC"];
  const joinClauses = [
    "JOIN post_locations pl ON pl.post_id = posts.id",
    "JOIN (SELECT id, username, avatar_url FROM users) u ON u.id = posts.user_id",
  ];

  if (isValidArray([min_date, max_date])) {
    whereClauses.push(
      `posts.date >= $${paramIndex++} AND posts.date <= $${paramIndex++}`
    );
    params.push(min_date, max_date);
  }

  if (isValidArray([min_price, max_price]) && min_price >= 0 && max_price > 0) {
    whereClauses.push(
      `posts.price >= $${paramIndex++} AND posts.price <= $${paramIndex++}`
    );
    params.push(min_price, max_price);
  }

  if (isValid(searchQuery)) {
    whereClauses.push(
      `(posts.title ILIKE $${paramIndex} OR posts.body ILIKE $${paramIndex++})`
    );
    params.push(`%${searchQuery}%`);
  }

  if (isValid(userId)) {
    whereClauses.push(`posts.user_id = $${paramIndex++}`);
    params.push(userId);
  }

  if (isValidArray([geolocation_latitude, geolocation_longitude])) {
    const miles = distance_miles || 20;
    const meters = miles * 1609.34;
    params.push(geolocation_latitude, geolocation_longitude, meters);
    whereClauses.push(
      `earth_distance(ll_to_earth(pl.geolocation_latitude, pl.geolocation_longitude), ll_to_earth($${paramIndex++}, $${paramIndex++})) < $${paramIndex++}`
    );

    orderClauses.splice(
      0,
      orderClauses.length,
      `earth_distance(ll_to_earth(pl.geolocation_latitude, pl.geolocation_longitude), ll_to_earth($1, $2)) ASC`
    );
  }

  if (isValid(category_ids) && category_ids.length > 0) {
    const categoryClauses = [];
    for (const categoryId of category_ids) {
      categoryClauses.push(`posts.category_id = $${paramIndex++}`);
      params.push(categoryId);
    }
    whereClauses.push(`(${categoryClauses.join(" OR ")})`);
  }

  params.push(offset, limit);

  const SQL = `
    SELECT ${selectStatements.join(", ")}
    FROM posts
    ${joinClauses.join(" ")}
    ${whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : ""}
    ORDER BY ${orderClauses.join(", ")}
    OFFSET $${paramIndex++}
    LIMIT $${paramIndex++}
  `;

  const { rows } = await db.query(SQL, params);
  return rows;
}
