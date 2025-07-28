import {
  createCartItem,
  deleteCartItem,
  getCartItem,
  getCartItems,
  updateCartItem,
} from "#db/query/cart_items";
import requireBody from "#middleware/requireBody";
import requireUser from "#middleware/requireUser";
import express from "express";

const router = express.Router();

router.use(requireUser);

router
  .route("/")
  .get(async (req, res) => {
    const cart_items = await getCartItems(req.user.id);

    res.status(200).json(cart_items);
  })
  .post(requireBody(["post_id", "quantity"]), async (req, res) => {
    const cart_item = await createCartItem({
      owner_id: req.user.id,
      ...req.body,
    });

    res.status(201).json(cart_item);
  });

router.param("postId", async (req, res, next, postId) => {
  const cart_item = await getCartItem(req.user.id, postId);

  if (!cart_item)
    return res.status(404).send("Couldn't find a cart item with that post id.");

  req.cart_item = cart_item;
  next();
});

router
  .route("/:postId")
  .get(async (req, res) => {
    res.status(200).json(req.cart_item);
  })
  .put(async (req, res) => {
    const update = await updateCartItem(
      req.cart_item.owner_id,
      req.cart_item.post_id,
      req.body
    );

    res.status(200).json(update);
  })
  .delete(async (req, res) => {
    await deleteCartItem(req.cart_item.owner_id, req.cart_item.post_id);
    res.status(204).send("Successfully deleted!");
  });

export default router;
