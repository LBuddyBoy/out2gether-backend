import {
  createPost,
  deletePostById,
  getPostById,
  getPosts,
  getPostsByField,
  getPostsNear,
  searchPosts,
  updatePost,
} from "#db/query/posts";
import express from "express";
import requireBody from "#middleware/requireBody";
import {
  createPostLocation,
  updatePostLocation,
} from "#db/query/post_locations";
import requireUser from "#middleware/requireUser";

const router = express.Router();

router.get("/:page/:limit", async (req, res) => {
  const { page, limit } = req.params;
  const posts = await getPosts(page, limit);

  res.status(200).json(posts);
});

router.get("/search/:page/:limit/:query", async (req, res) => {
  const { page, limit, query } = req.params;
  const posts = await searchPosts(query, page, limit);

  res.status(200).json(posts);
});

router.get(
  "/filter/:field/:page/:limit",
  requireBody(["minimum", "maximum"]),
  async (req, res) => {
    const { field, page, limit } = req.params;
    const { minimum, maximum } = req.body;

    res
      .status(200)
      .json(await getPostsByField(field, minimum, maximum, page, limit));
  }
);

router.get(
  "/near/:page/:limit/:miles",
  requireBody(["geolocation_latitude", "geolocation_longitude"]),
  async (req, res) => {
    const { page, limit, miles } = req.params;
    const { geolocation_latitude, geolocation_longitude } = req.body;
    const posts = await getPostsNear({
      geolocation_latitude,
      geolocation_longitude,
      miles,
      page,
      limit,
    });

    res.status(200).json(posts);
  }
);

router.post(
  "/",
  requireBody([
    "user_id",
    "title",
    "body",
    "price",
    "date",
    "address",
    "country",
    "state",
    "city",
    "zip_code",
    "geolocation_longitude",
    "geolocation_latitude",
  ]),
  async (req, res) => {
    const post = await createPost(req.body);

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
