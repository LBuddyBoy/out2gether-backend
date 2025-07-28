import express from "express";
import cors from "cors";
import morgan from "morgan";
import usersRouter from "#api/usersRouter";
import postRouter from "#api/postRouter";
import categoryRouter from "#api/categoryRouter";
import cartRouter from "#api/cartRouter";
import getUserFromToken from "#middleware/getUserFromToken";

const app = express();

app.use(cors({ origin: /localhost:\d+$/ }));
app.use(express.json({ limit: "5mb" }));
app.use(morgan("dev"));

app.use(getUserFromToken);

app.use("/users", usersRouter);
app.use("/cart", cartRouter);
app.use("/categories", categoryRouter);
app.use("/posts", postRouter);

app.get("/", (req, res) => {
  res.send("Out2Gether Online ✅");
});

app.use((err, req, res, next) => {
  switch (err.code) {
    case "23505":
      return res.status(400).send(err.detail);
    default:
      next(err);
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Sorry! Something went wrong.");
});

export default app;
