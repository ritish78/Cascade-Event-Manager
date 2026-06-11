import { Router } from "express";
import { createEventController, upcomingEvents } from "src/controller/event.controller";
import { authenticate, optionalAuthenticate } from "src/middleware/authenticate";

const router = Router();

router.post("/", authenticate, createEventController);
router.get("/upcoming", optionalAuthenticate, upcomingEvents);

export default router;
