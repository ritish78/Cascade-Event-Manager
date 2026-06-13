import { Router } from "express";
import {
  createEventController,
  deleteEventController,
  eventByIdController,
  filterEventsController,
  pastEventsController,
  upcomingEventsController,
  updateEventController,
} from "src/controller/event.controller";
import { authenticate, optionalAuthenticate } from "src/middleware/authenticate";

const router = Router();

router.post("/", authenticate, createEventController);
router.get("/upcoming", optionalAuthenticate, upcomingEventsController);
router.get("/past", optionalAuthenticate, pastEventsController);
router.get("/:id", optionalAuthenticate, eventByIdController);
router.delete("/:id", authenticate, deleteEventController);
router.patch("/:id", authenticate, updateEventController);
router.get("/", optionalAuthenticate, filterEventsController);

export default router;
