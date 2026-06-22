import app from "./server";
import { EXPRESS_SERVER_PORT } from "./config";
import db from "./db";

async function main() {
  await db.migrate.latest();
  console.log("Migrations ran successfully");

  await db.seed.run();
  console.log("Seeds ran successfully");

  app.listen(EXPRESS_SERVER_PORT, () => {
    console.log("Server running on port: ", EXPRESS_SERVER_PORT);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
