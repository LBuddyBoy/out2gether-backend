import {
  deleteNotification,
  getNotificationById,
  getNotificationsAmountByUserId,
  getNotificationsByUserId,
  markNotificationAsRead,
} from "#db/query/notifications";
import requireQuery from "#middleware/requireQuery";
import requireUser from "#middleware/requireUser";
import express from "express";
const router = express.Router();

router.use(requireUser);

router.route("/").get(requireQuery(["page", "limit"]), async (req, res) => {
  const { page, limit } = req.query;

  res.status(200).json(
    await getNotificationsByUserId(req.user.id, {
      ...req.query,
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    })
  );
});

router.route("/amount").get(async (req, res) => {
  const amount = await getNotificationsAmountByUserId(req.user.id);
  res.status(200).json({ amount });
});

router.param("id", async (req, res, next, id) => {
  const notification = await getNotificationById(id);

  if (!notification) {
    return res.status(404).send("Notification not found.");
  }

  req.notification = notification;
  next();
});

router
  .route("/:id")
  .get(async (req, res) => {
    res.status(200).json(req.notification);
  })
  .patch(async (req, res) => {
    const updatedNotification = await markNotificationAsRead(
      req.notification.id
    );

    if (updatedNotification) {
      res.status(200).json(updatedNotification);
    }
  })
  .delete(async (req, res) => {
    const deleted = await deleteNotification(req.notification.id);
    if (deleted) {
      res.status(204).send("Notification deleted.");
    }
  });

export default router;
