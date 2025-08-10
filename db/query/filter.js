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
  searchQuery,
  page,
  limit,
}) {
  const offset = (page - 1) * limit;
  const params = [offset, limit];
  const selectStatements = ["posts.*"];
  const whereClauses = [];
  const orderClauses = ["posts.id", "posts.created_at"];
  const joinClauses = [];

  if (isValidArray([min_date, max_date])) {
    const param = params.length;
    whereClauses.push(
      `posts.date >= $${param + 1} AND posts.date <= $${param + 2}`
    );
    params.push(min_date.split("T")[0], max_date.split("T")[0]);
    orderClauses.push("posts.date");
  }

  if (isValidArray([min_price, max_price]) && min_price > 0 && max_price > 0) {
    const param = params.length;
    whereClauses.push(
      `posts.price >= $${param + 1} AND posts.price <= $${param + 2}`
    );
    params.push(min_price, max_price);
    orderClauses.push("posts.price");
  }

  if (isValid(searchQuery)) {
    const param = params.length;
    whereClauses.push(
      `posts.title ILIKE $${param + 1} OR posts.body ILIKE $${param + 1}`
    );
    params.push(`%${searchQuery}%`);
  }

  if (
    isValidArray([geolocation_latitude, geolocation_longitude, distance_miles])
  ) {
    const param = params.length;
    const JOIN_SQL = `
    JOIN (
      SELECT pl.*, earth_distance(ll_to_earth(pl.geolocation_latitude, pl.geolocation_longitude), ll_to_earth($${
        param + 1
      }, $${param + 2})) AS distance_meters
      FROM post_locations pl
    ) post_locations ON post_locations.post_id = posts.id AND post_locations.distance_meters < $${
      param + 3
    }
    `;
    const meters = distance_miles * 1609.34;

    joinClauses.push(JOIN_SQL);
    orderClauses.push("post_locations.distance_meters");
    selectStatements.push("row_to_json(post_locations) AS location");
    params.push(geolocation_latitude, geolocation_longitude, meters);
  }

  if (isValid(category_ids) && category_ids.length > 0) {
    const categoryClauses = [];

    for (const index in category_ids) {
      const categoryId = category_ids[index];
      const param = params.length;
      categoryClauses.push(`posts.category_id = $${param + 1}`);
      params.push(categoryId);
    }

    whereClauses.push("(" + categoryClauses.join(" OR ") + ")");
  }

  const SQL = `
  SELECT ${selectStatements.join(", ")}
  FROM posts
  ${joinClauses.length > 0 ? joinClauses.join(" ") : ""}
  ${whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : ""}
  ORDER BY (${orderClauses.join(", ")}) ASC
  OFFSET $1
  LIMIT $2
  `;

  console.log("SQL:", SQL);

  const { rows } = await db.query(SQL, params);

  return rows;
}
