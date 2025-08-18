import {
  createUser,
  getUserById,
  updateUser,
  validateAccount,
  getUserByEmail,
} from "#db/query/users";
import express from "express";
import requireBody from "#middleware/requireBody";
import { createJWT, validateJWT } from "#util/jwt";
import requireUser from "#middleware/requireUser";
import { OAuth2Client } from "google-auth-library";

const router = express.Router();
const client = new OAuth2Client();

router.post(
  "/register",
  requireBody(["username", "email", "password"]),
  async (req, res, next) => {
    try {
      const user = await createUser(req.body);
      if (!user) {
        return res.status(400).send("Could not create user.");
      }
      const jwt = createJWT(user.id);
      res.status(201).json({ jwt, user });
    } catch (error) {
      next(error);
    }
  }
);

router.post("/login", async (req, res, next) => {
  try {
    let user;
    const { googleToken, email, password } = req.body;

    if (googleToken) {
      const ticket = await client.verifyIdToken({
        idToken: googleToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();

      const existingUser = await getUserByEmail(payload.email);
      if (existingUser) {
        user = existingUser;
      } else {
        user = await createUser({
          username: payload.name,
          email: payload.email,
          avatar_url: payload.picture,
        });
      }
    } else if (email && password) {
      user = await validateAccount({ email, password });
      if (!user) {
        return res.status(401).send("Invalid credentials.");
      }
    } else {
      return res.status(400).send("Invalid login request.");
    }

    const jwt = createJWT(user.id);
    res.status(200).json({ jwt, user });
  } catch (error) {
    next(error);
  }
});

router.post("/me", requireBody(["jwt"]), async (req, res) => {
  const { jwt } = req.body;
  const { id } = validateJWT(jwt);

  if (!id) {
    return res.status(400).send("That jwt is expired or is invalid.");
  }

  const user = await getUserById(id);

  if (!user) {
    return res.status(404).send("A user with that id could not be found.");
  }

  res.status(200).json(user);
});

router.param("id", async (req, res, next, id) => {
  const user = await getUserById(id);

  if (!user)
    return res.status(404).send("A user with that name could not be found.");

  req.target = user;
  next();
});

router.route("/:id").put(requireUser, async (req, res) => {
  const update = await updateUser(req.target.id, req.body);

  res.status(200).json(update);
});

export default router;
