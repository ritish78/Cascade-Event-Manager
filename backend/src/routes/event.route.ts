import { Router } from "express";
import {
  createEventController,
  deleteEventController,
  eventById,
  pastEvents,
  upcomingEvents,
  updateEventController,
} from "src/controller/event.controller";
import { authenticate, optionalAuthenticate } from "src/middleware/authenticate";

const router = Router();

router.post("/", authenticate, createEventController);
router.get("/upcoming", optionalAuthenticate, upcomingEvents);
router.get("/past", optionalAuthenticate, pastEvents);
router.get("/:id", optionalAuthenticate, eventById);
router.delete("/:id", authenticate, deleteEventController);
router.patch("/:id", authenticate, updateEventController);

export default router;
