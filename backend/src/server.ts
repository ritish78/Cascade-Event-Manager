import express, { Request, Response } from "express";
import helmet from "helmet";
import cookies from "cookie-parser";
import { errorHandler } from "./middleware/errorHandler.middleware";

//routes imports
import authRoute from "./routes/auth.route";
import eventRoute from "./routes/event.route";
import tagRoute from "./routes/tag.route";

const app = express();

app.disable("x-powered-by");

app.use(helmet());
app.use(express.json());
app.use(cookies());

app.get("/api/v1/ping", (req: Request, res: Response) => {
  return res.status(200).json({ message: "Pong!" });
});

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/events", eventRoute);
app.use("/api/v1/tags", tagRoute);

app.use(errorHandler);

export default app;
