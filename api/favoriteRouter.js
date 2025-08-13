import express from "express";
import requireUser from "#middleware/requireUser";
import {
  createFavoritePost,
  deleteFavoritePost,
  getFavoritePost,
  getFavoritePosts,
} from "#db/query/favorite_posts";
import requireBody from "#middleware/requireBody";
import { getPostById } from "#db/query/posts";

const router = express.Router();

router
  .route("/")
  .post(requireUser, requireBody(["post_id"]), async (req, res) => {
    const favorite = await createFavoritePost({
      user_id: req.user.id,
      ...req.body,
    });

    res.status(201).json(favorite);
  })
  .patch(requireUser, requireBody(["post_id"]), async (req, res) => {
    const { post_id } = req.body;
    const isFavorited = await getFavoritePost(req.user.id, post_id);

    if (isFavorited) {
      const deleted = await deleteFavoritePost(req.user.id, post_id);

      return res.status(204).json(deleted);
    }

    const favorite = await createFavoritePost({
      user_id: req.user.id,
      post_id,
    });

    res.status(201).json(favorite);
  })
  .get(requireUser, async (req, res) => {
    const favorites = await getFavoritePosts(req.user.id);

    res.status(200).json(favorites);
  })
  .delete(requireUser, requireBody(["post_id"]), async (req, res) => {
    const deleted = await deleteFavoritePost(req.user.id, req.body.post_id);

    res.status(204).json(deleted);
  });

router.param("id", async (req, res, next, id) => {
  const post = await getPostById(id, req.user?.id);

  if (!post)
    return res.status(404).send("A post with that id couldn't be found.");

  req.post = post;
  next();
});

router.route("/:id").get(requireUser, async (req, res) => {
  const favorite = await getFavoritePost(req.user.id, req.post.id);

  res.status(200).json(favorite ? true : false);
});

export default router;
