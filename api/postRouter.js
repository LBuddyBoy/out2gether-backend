import {
  createPost,
  deletePostById,
  getAllPosts,
  getPostById,
  updatePost,
} from "#db/query/posts";
import express from "express";
import requireBody from "#middleware/requireBody";
import {
  createPostLocation,
  updatePostLocation,
} from "#db/query/post_locations";

const router = express.Router();

router
  .route("/")
  .get(async (req, res) => {
    const posts = await getAllPosts();

    res.status(200).json(posts);
  })
  .post(
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
      "geolocation_latitude",
      "geolocation_longitude",
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
    return res.status(404).json("A post with that id couldn't be found.");

  req.post = post;
  next();
});

router
  .route("/:id")
  .get(async (req, res) => {
    res.status(200).json(req.post);
  })
  .put(requireBody([]), async (req, res) => {
    const update = await updatePost(req.post.id, req.body);

    res.status(200).json(update);
  })
  .delete(async (req, res) => {
    const post = await deletePostById(req.post.id);

    if (post) {
      res.status(204);
    }
  });

router.route("/:id/location").put(requireBody([]), async (req, res) => {
  const post_location = await updatePostLocation(req.post.id, req.body);

  res.status(200).json(post_location);
});

export default router;
