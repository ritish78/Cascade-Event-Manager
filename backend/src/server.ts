import express, { Request, Response } from "express";
import helmet from "helmet";
import cookies from "cookie-parser";
import swaggerUiExpress from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";

import { errorHandler } from "./middleware/errorHandler.middleware";

//routes imports
import authRoute from "./routes/auth.route";
import eventRoute from "./routes/event.route";
import tagRoute from "./routes/tag.route";
import categoriesRoute from "./routes/categories.route";

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
app.use("/api/v1/categories", categoriesRoute);
app.use("/api/v1/api-docs", swaggerUiExpress.serve, swaggerUiExpress.setup(swaggerSpec));

app.use(errorHandler);

export default app;
