import {
  getCategories,
  getCategoryById,
  getCategoryPosts,
} from "#db/query/categories";
import express from "express";
const router = express.Router();

router.route("/").get(async (req, res) => {
  const categories = await getCategories();

  res.status(200).json(categories);
});

router.param("id", async (req, res, next, id) => {
  const category = await getCategoryById(id);

  if (!category)
    return res.status(404).json("A category with that id could not be found.");

  req.category = category;
  next();
});

router.get("/:id/posts/:page/:limit", async (req, res) => {
  const { page, limit } = req.params;
  const posts = await getCategoryPosts(req.category.id, page, limit);

  res.status(200).json(posts);
});

export default router;
