import { Router } from "express";
import {
  createEventController,
  eventById,
  pastEvents,
  upcomingEvents,
} from "src/controller/event.controller";
import { authenticate, optionalAuthenticate } from "src/middleware/authenticate";

const router = Router();

router.post("/", authenticate, createEventController);
router.get("/upcoming", optionalAuthenticate, upcomingEvents);
router.get("/past", optionalAuthenticate, pastEvents);
router.get("/:id", optionalAuthenticate, eventById);

export default router;
