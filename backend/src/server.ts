import express, { Request, Response } from "express";
import helmet from "helmet";
import { errorHandler } from "./middleware/errorHandler.middleware";

const app = express();

app.disable("x-powered-by");

app.use(helmet());

app.get("/api/v1/ping", (req: Request, res: Response) => {
  return res.status(200).json({ message: "Pong!" });
});

app.use(errorHandler);

export default app;
