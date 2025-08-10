/** Checks if the request query contains the required fields */
export default function requireQuery(fields, requireQuery = true) {
  return (req, res, next) => {
    if (requireQuery && !req.query)
      return res.status(400).send("Request query is required.");

    const missing = fields.filter((field) => !(field in req.query));
    if (missing.length > 0)
      return res
        .status(400)
        .send(`Missing Query fields: ${missing.join(", ")}`);

    next();
  };
}
