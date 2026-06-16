import { Router } from "express";
import {
  createEventController,
  deleteEventController,
  eventByIdController,
  filterEventsController,
  getAllEventsOfUserController,
  inviteUserToEventController,
  joinEventController,
  pastEventsController,
  upcomingEventsController,
  updateEventController,
} from "src/controller/event.controller";
import { authenticate, optionalAuthenticate } from "src/middleware/authenticate";

const router = Router();

router.post("/", authenticate, createEventController);
router.get("/upcoming", optionalAuthenticate, upcomingEventsController);
router.get("/past", optionalAuthenticate, pastEventsController);
router.get("/mine", authenticate, getAllEventsOfUserController);
router.get("/:id", optionalAuthenticate, eventByIdController);
router.post("/:id/join", authenticate, joinEventController);
router.post("/:id/invite", authenticate, inviteUserToEventController);
router.delete("/:id", authenticate, deleteEventController);
router.patch("/:id", authenticate, updateEventController);
router.get("/", optionalAuthenticate, filterEventsController);

export default router;
