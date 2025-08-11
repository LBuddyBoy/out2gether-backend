import {
  createPost,
  deletePostById,
  getPostById,
  updatePost,
} from "#db/query/posts";
import express from "express";
import requireBody from "#middleware/requireBody";
import {
  createPostLocation,
  updatePostLocation,
} from "#db/query/post_locations";
import requireUser from "#middleware/requireUser";
import requireQuery from "#middleware/requireQuery";
import { getFilterByUserId, getFilteredPosts } from "#db/query/filter";

const router = express.Router();

router.get("/", requireQuery(["page", "limit"], true), async (req, res) => {
  const { page, limit, autoFilter } = req.query;
  let filter = {};

  if (autoFilter && req.user) {
    filter = (await getFilterByUserId(req.user.id)) || {};
  }

  res.status(200).json(
    await getFilteredPosts({
      ...filter,
      ...req.query,
      page: Number(page),
      limit: Number(limit),
    })
  );
});

router.post(
  "/",
  requireUser,
  requireBody([
    "category_id",
    "title",
    "body",
    "price",
    "date",
    "time",
    "image_url",
    "address",
    "country",
    "state",
    "city",
    "zip_code",
    "geolocation_longitude",
    "geolocation_latitude",
  ]),
  async (req, res) => {
    console.log("Create Post: ", req.body);

    const post = await createPost({
      user_id: req.user.id,
      ...req.body,
    });

    if (!post) {
      return;
    }

    const post_location = await createPostLocation({
      post_id: post.id,
      ...req.body,
    });

    if (!post_location) {
      return;
    }

    res.status(201).json("Post created!");
  }
);

router.param("id", async (req, res, next, id) => {
  const post = await getPostById(id);

  if (!post)
    return res.status(404).send("A post with that id couldn't be found.");

  req.post = post;
  next();
});

router
  .route("/:id")
  .get(async (req, res) => {
    res.status(200).json(req.post);
  })
  .put(requireUser, requireBody([]), async (req, res) => {
    if (req.post.owner_id !== req.user.id) {
      return res.status(400).send("You do not own this post.");
    }

    const update = await updatePost(req.post.id, req.body);

    res.status(200).json(update);
  })
  .delete(requireUser, async (req, res) => {
    if (req.post.owner_id !== req.user.id) {
      return res.status(400).send("You do not own this post.");
    }

    const post = await deletePostById(req.post.id);

    if (post) {
      res.status(204).send("Post deleted.");
    }
  });

router.route("/:id/location").put(requireBody([]), async (req, res) => {
  const post_location = await updatePostLocation(req.post.id, req.body);

  res.status(200).json(post_location);
});

export default router;
