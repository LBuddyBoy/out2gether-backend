import jwt from "jsonwebtoken";

export function createJWT(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: 3600 });
}

export function validateJWT(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}
