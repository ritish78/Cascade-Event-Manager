import { Request, Response, NextFunction } from "express";
import {
  CreateEventInput,
  createEventSchema,
  UpdateEventInput,
  updateEventSchema,
} from "src/schema/event.schema";
import {
  createEvent,
  createNewEvent,
  deleteEvent,
  getEventWithDetailsById,
  getPastEvents,
  getUpcomingEvents,
  updateEventByItsId,
} from "src/services/event.services";
import { AuthError, BadRequestError, NotFoundError } from "src/utils/error";

/**
 * @route           /api/v1/events
 * @method          POST
 * @access          Autheticated
 */
export const createEventController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userInput: CreateEventInput = createEventSchema.parse(req.body);

    console.log("Sent correct info!");

    if (!req.user?.id) {
      throw new AuthError("Missing tokens! Login in first!");
    }

    // const event = await createEvent(
    //   req.user.id,
    //   userInput.name,
    //   userInput.description,
    //   userInput.location,
    //   userInput.isPrivate,
    //   userInput.categoryId,
    //   userInput.eventDate,
    //   userInput.tags || [],
    // );

    const event = await createNewEvent(
      req.user.id,
      userInput.name,
      userInput.description,
      userInput.location,
      userInput.isPrivate,
      userInput.categoryId,
      userInput.eventDate,
      req.user.id,
      "accepted",
      userInput.tags,
    );

    res.status(201).send({ message: `Event created of id ${event.id}` });
  } catch (error) {
    next(error);
  }
};

/**
 * @route           /api/v1/events/upcoming?limit=10&page=1
 * @method          GET
 * @access          Optional Authenticated
 */
export const upcomingEvents = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  if (isNaN(page) || isNaN(limit)) {
    throw new BadRequestError("Invalid request query provided!");
  }

  const userId = req.user?.id ?? null;

  const events = await getUpcomingEvents(userId, limit, page);

  res.status(200).send(events);
};

/**
 * @route           /api/v1/events/past?limit=10&page=1
 * @method          GET
 * @access          Optional Autheticated
 */
export const pastEvents = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  if (isNaN(page) || isNaN(limit)) {
    throw new BadRequestError("Invalid request query provided!");
  }

  const userId = req.user?.id ?? null;

  const events = await getPastEvents(userId, limit, page);

  res.status(200).send(events);
};

/**
 * @route           /api/v1/events/:id
 * @method          GET
 * @access          Optional Autheticated
 */
export const eventById = async (req: Request, res: Response) => {
  const userId = req.user?.id ?? null;
  const eventId = Number(req.params.id);

  if (!eventId || isNaN(eventId)) {
    throw new BadRequestError("Invalid Event ID provided!");
  }

  const event = await getEventWithDetailsById(eventId, userId);

  if (!event) {
    throw new NotFoundError(
      `You don't have the permission to view the event or the event of id ${eventId} does not exists!`,
    );
  }

  res.status(200).send(event);
};

/**
 * @route           /api/v1/events
 * @method          DELETE
 * @access          Autheticated
 */
export const deleteEventController = async (req: Request, res: Response) => {
  const eventId = Number(req.params.id);

  if (!eventId || isNaN(eventId)) {
    throw new BadRequestError("Invalid Event ID provided!");
  }

  if (!req.user || !req.user.id) {
    throw new NotFoundError(
      `You don't have permission to delete the event or the event of id ${eventId} does not exists!`,
    );
  }

  await deleteEvent(eventId, req.user.id);

  res.status(200).send({ message: `Event of id ${eventId} deleted!` });
};

/**
 * @route               /api/v1/events/:id
 * @method              PUT
 * @access              Authenticated
 */
export const updateEventController = async (req: Request, res: Response) => {
  const eventId = Number(req.params.id);

  if (!eventId || isNaN(eventId)) {
    throw new BadRequestError("Invalid Event ID provided!");
  }

  if (!req.user || !req.user.id) {
    throw new NotFoundError(
      `You don't have permission to update the event or the event of id ${eventId} does not exists!`,
    );
  }

  const data: UpdateEventInput = updateEventSchema.parse(req.body);

  const updatedEvent = await updateEventByItsId(eventId, req.user.id, data);

  res.status(200).send({ message: `Event of ID ${eventId} updated successfully!`, event: updatedEvent });
};
