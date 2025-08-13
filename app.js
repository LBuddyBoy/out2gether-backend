import express from "express";
import cors from "cors";
import morgan from "morgan";
import usersRouter from "#api/usersRouter";
import favoriteRouter from "#api/favoriteRouter";
import postRouter from "#api/postRouter";
import categoryRouter from "#api/categoryRouter";
import cartRouter from "#api/cartRouter";
import filterRouter from "#api/filterRouter";
import notificationRouter from "#api/notificationRouter";
import getUserFromToken from "#middleware/getUserFromToken";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json({ limit: "5mb" }));
app.use(morgan("dev"));

app.use(getUserFromToken);

app.use("/users", usersRouter);
app.use("/filter", filterRouter);
app.use("/favorites", favoriteRouter);
app.use("/cart", cartRouter);
app.use("/categories", categoryRouter);
app.use("/posts", postRouter);
app.use("/notifications", notificationRouter);

app.get("/", (req, res) => {
  res.send("Out2Gether Online ✅");
});

app.use((err, req, res, next) => {
  switch (err.code) {
    case "23505":
      return res.status(400).send(err.code);
    default:
      next(err);
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Sorry! Something went wrong.");
});

export default app;
