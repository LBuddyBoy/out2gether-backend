import { getUserById } from "#db/query/users";
import { validateJWT } from "#util/jwt";

export default async function getUserFromToken(req, res, next) {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return next();
  }

  const token = authorization.split(" ")[1];

  try {
    const { id } = validateJWT(token);
    const user = await getUserById(id);

    if (user) req.user = user;
  } catch (error) {
    console.log(error);
  }

  next();
}
