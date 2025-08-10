import {
  createFilter,
  getFilterByUserId,
  updateFilter,
} from "#db/query/filter";
import requireUser from "#middleware/requireUser";
import express from "express";
const router = express.Router();

router.use(requireUser);

router.use(async (req, res, next) => {
  let filter = await getFilterByUserId(req.user.id);

  if (!filter) {
    filter = await createFilter({ user_id: req.user.id });
  }

  req.filter = filter;
  next();
});

router
  .route("/")
  .get(async (req, res) => {
    res.status(200).json(req.filter);
  })
  .put(async (req, res) => {
    const updatedFilter = await updateFilter(req.user.id, req.body);

    res.status(200).json(updatedFilter);
  });

export default router;
