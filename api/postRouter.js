import {
  createPost,
  deletePostById,
  getPostById,
  getPosts,
  getPostsNear,
  updatePost,
} from "#db/query/posts";
import express from "express";
import requireBody from "#middleware/requireBody";
import {
  createPostLocation,
  updatePostLocation,
} from "#db/query/post_locations";
import requireUser from "#middleware/requireUser";
import {
  createFavoritePost,
  deleteFavoritePost,
  getFavoritePosts,
} from "#db/query/favorite_posts";

const router = express.Router();

router
  .route("/favorites")
  .post(requireUser, requireBody(["post_id"]), async (req, res) => {
    const favorite = await createFavoritePost({
      user_id: req.user.id,
      ...req.body,
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

router.get("/:page/:limit", async (req, res) => {
  const { page, limit } = req.params;
  const posts = await getPosts(page, limit);

  res.status(200).json(posts);
});

router.get(
  "/:page/:limit/:miles",
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
  .put(async (req, res) => {
    const update = await updatePost(req.post.id, req.body);

    res.status(200).json(update);
  })
  .delete(async (req, res) => {
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
