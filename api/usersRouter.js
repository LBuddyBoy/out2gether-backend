import { createUser, getUserById, validateAccount } from "#db/query/users";
import express from "express";
import requireBody from "#middleware/requireBody";
import { createJWT, validateJWT } from "#util/jwt";
const router = express.Router();

router.post(
  "/register",
  requireBody(["username", "email", "password"]),
  async (req, res) => {
    const user = await createUser(req.body);
    if (!user) return;
    res.status(201).send("User created!");
  }
);

router.post(
  "/login",
  requireBody(["email", "password"]),
  async (req, res, next) => {
    try {
      const user = await validateAccount(req.body);

      if (!user) {
        return res.status(401).send("Invalid credentials.");
      }

      const jwt = createJWT(user.id);

      res.status(200).json({ jwt, user });
    } catch (error) {
      next(error);
    }
  }
);

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

export default router;
