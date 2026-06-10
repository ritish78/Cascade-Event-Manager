import { Router } from "express";
import { createEventController } from "src/controller/event.controller";
import { authenticate } from "src/middleware/authenticate";

const router = Router();

router.post("/", authenticate, createEventController);

export default router;
