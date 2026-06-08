import express, { Request, Response } from "express";
import helmet from "helmet";

const app = express();

app.disable("x-powered-by");

app.use(helmet());

app.get("/api/v1/ping", (req: Request, res: Response) => {
  return res.status(200).json({ message: "Pong!" });
});

export default app;
