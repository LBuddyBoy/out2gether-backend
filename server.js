import app from "#app";
import db from "#db/client";

const HOST = process.env.HOST ?? "127.0.0.1";
const PORT = process.env.PORT ?? 3000;

await db.connect();

app.listen(PORT, HOST, () => {
  console.log(`Listening on ${HOST}:${PORT}...`);
});
