import { Request, Response, NextFunction } from "express";
import {
  CreateEventInput,
  createEventSchema,
  eventFilterSchema,
  UpdateEventInput,
  updateEventSchema,
  UserInviteInput,
  userInviteSchema,
} from "src/schema/event.schema";
import {
  createNewEvent,
  deleteEvent,
  filterEventsByTagsAndEventType,
  getEventWithDetailsById,
  getPastEvents,
  getUpcomingEvents,
  inviteUserToEvent,
  joinUserToEvent,
  updateEventByItsId,
} from "src/services/event.services";
import { EventFilters } from "src/types/event.types";
import { AuthError, BadRequestError, NotFoundError } from "src/utils/error";
import { parseTimeFrame } from "src/utils/parseTimeframe";

/**
 * @route           /api/v1/events
 * @method          POST
 * @access          Autheticated
 */
export const createEventController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userInput: CreateEventInput = createEventSchema.parse(req.body);

    if (!req.user?.id) {
      throw new AuthError("Missing tokens! Login in first!");
    }

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
      userInput.tagIds,
    );

    res.status(201).send({ message: `New Event created!`, event_id: event.id });
  } catch (error) {
    next(error);
  }
};

/**
 * @route           /api/v1/events/upcoming?limit=10&page=1
 * @method          GET
 * @access          Optional Authenticated
 */
export const upcomingEventsController = async (req: Request, res: Response) => {
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
export const pastEventsController = async (req: Request, res: Response) => {
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
export const eventByIdController = async (req: Request, res: Response) => {
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

/**
 * @route               /api/v1/events
 * @method              GET
 * @access              Authenticated
 * @example             /api/v1/events?tagIds=1,2,3&isPrivate=true [filtering events by tagIds and isPrivate]
 * @example
 */
export const filterEventsController = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  if (isNaN(page) || isNaN(limit)) {
    throw new BadRequestError("Invalid request query provided!");
  }

  //For filtering with just isPrivate and tags, we were using this way to set
  //the filtering object. Now, adding more fields and will cause more and more
  //lines of checks. We will now move to Zod to check the user's req.query
  //   if (req.query.isPrivate !== undefined) {
  //     filters.isPrivate = req.query.isPrivate === "true";
  //   }

  //   const tagIdsFromQuery = req.query.tagIds;
  //   if (tagIdsFromQuery) {
  //     //without (tagIdsFromQuery as string), TS was not allowing to split
  //     const tagIds = Array.isArray(tagIdsFromQuery) ? tagIdsFromQuery : (tagIdsFromQuery as string).split(",");

  //     filters.tagIds = tagIds.map(Number).filter((id) => !isNaN(id));
  //   }

  const parsedFilters = eventFilterSchema.parse(req.query);
  const filters: EventFilters = {
    isPrivate: parsedFilters.isPrivate,
    tagIds: parsedFilters.tagIds,
    createdBy: parsedFilters.createdBy,
    categoryId: parsedFilters.categoryId,
    timeframe: parseTimeFrame(parsedFilters.timeframe),
    from: parsedFilters.from,
    to: parsedFilters.to,
  };

  const userId = req.user?.id ?? null;

  const events = await filterEventsByTagsAndEventType(userId, limit, page, filters);

  res.status(200).send(events);
};

/**
 * @route           /api/v1/events/:id/join
 * @method          POST
 * @access          Authenticated
 */
export const joinEventController = async (req: Request, res: Response): Promise<void> => {
  const eventId = Number(req.params.id);

  if (!eventId || isNaN(eventId)) {
    throw new BadRequestError("Invalid Event ID provided!");
  }

  if (!req.user || !req.user.id) {
    throw new NotFoundError(
      `You don't have permission to join the event or the event of id ${eventId} does not exists!`,
    );
  }

  await joinUserToEvent(eventId, req.user.id);

  res.status(200).send({ message: "You joined the event!" });
};

/**
 * @route            /api/v1/events/:id/invite
 * @method           POST
 * @access           Authenticated
 */
export const inviteUserToEventController = async (req: Request, res: Response) => {
  const eventId = Number(req.params.id);

  if (!eventId || isNaN(eventId)) {
    throw new BadRequestError("Invalid Event ID provided!");
  }

  if (!req.user || !req.user.id) {
    throw new NotFoundError(
      `You don't have permission to invite other users or the event of id ${eventId} does not exists!`,
    );
  }

  const userBody: UserInviteInput = userInviteSchema.parse(req.body);

  const invitedUser = await inviteUserToEvent(eventId, req.user.id, userBody.email);

  res.status(200).send({ message: `Invited ${invitedUser.full_name} successfully!` });
};

/**
 * @route           /api/v1/events/mine
 * @method          GET
 * @access          Authenticated
 */
export const getAllEventsOfUserController = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  if (isNaN(page) || isNaN(limit)) {
    throw new BadRequestError("Invalid request query provided!");
  }

  //we will use it after autheticated middleware, so req.user.id will not be empty
  //but still having checks like in the above functions
  if (!req.user || !req.user.id) {
    throw new NotFoundError(`You need to login first!`);
  }

  const filter = {
    createdBy: req.user.id,
    timeframe: parseTimeFrame(req.query.timeframe),
  };

  const events = await filterEventsByTagsAndEventType(req.user.id, limit, page, filter);

  res.status(200).send(events);
};
