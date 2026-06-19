import { Request, Response, NextFunction } from "express";
import {
  CreateEventInput,
  createEventSchema,
  eventFilterSchema,
  UpdateEventInput,
  updateEventSchema,
  UserInviteInput,
  userInviteSchema,
  UserResponseToInvitation,
  userResponseToInvitation,
} from "../schema/event.schema";
import {
  createNewEvent,
  deleteEvent,
  filterEventsByTagsAndEventType,
  getEventWithDetailsById,
  getPastEvents,
  getUpcomingEvents,
  getUserMemberEvents,
  inviteUserToEvent,
  joinUserToEvent,
  respondToEventInvitation,
  updateEventByItsId,
} from "../services/event.services";
import { EventFilters } from "../types/event.types";
import { AuthError, BadRequestError, NotFoundError } from "../utils/error";
import { parseMemberStatus, parseTimeFrame } from "../utils/parseTimeFrame";
import logger from "../utils/logger";

/**
 * @openapi
 * /events:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEventInput'
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: New Event created!
 *                 eventId:
 *                   type: integer
 *                   example: 42
 *       400:
 *         description: Invalid request body
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ZodError'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const createEventController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userInput: CreateEventInput = createEventSchema.parse(req.body);

    if (!req.user?.id) {
      throw new AuthError("Missing tokens! Login in first!");
    }

    logger.info(
      `User of id ${req.user.id} is creating an event with name ${userInput.name}`,
      userInput,
      true,
    );

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

    logger.info(`Event of id ${event.id} created successfully!`, event, true);

    res.status(201).send({ message: `New Event created!`, eventId: event.id });
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /events/upcoming:
 *   get:
 *     summary: Get upcoming events
 *     description: Get lists of upcoming events. If the user is logged in, it returns private events as well.
 *     tags: [Events]
 *     security:
 *       - cookieAuth: []
 *       - {}
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of events per page
 *     responses:
 *       200:
 *         description: Paginated list of upcoming events
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedEvents'
 */
export const upcomingEventsController = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  if (isNaN(page) || isNaN(limit)) {
    logger.error("Invalid query parameters for upcoming events", req.query, true);
    throw new BadRequestError("Invalid request query provided!");
  }

  const userId = req.user?.id ?? null;

  logger.info(`Fetching upcoming events for user of id ${userId ?? "Guest"}`, { page, limit }, true);

  const events = await getUpcomingEvents(userId, limit, page);

  res.status(200).send(events);
};

/**
 * @openapi
 * /events/past:
 *   get:
 *     summary: Get past events
 *     description: Get lists of past events. If the user is logged in, it returns private events as well.
 *     tags: [Events]
 *     security:
 *       - cookieAuth: []
 *       - {}
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of events per page
 *     responses:
 *       200:
 *         description: Paginated list of past events
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedEvents'
 */
export const pastEventsController = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  if (isNaN(page) || isNaN(limit)) {
    logger.error("Invalid query parameters for past events", req.query, true);
    throw new BadRequestError("Invalid request query provided!");
  }

  const userId = req.user?.id ?? null;

  logger.info(`Fetching past events for user of id ${userId ?? "Guest"}`, { page, limit }, true);

  const events = await getPastEvents(userId, limit, page);

  res.status(200).send(events);
};

/**
 * @openapi
 * /events/{id}:
 *   get:
 *     summary: Get event by its id
 *     description: Get details of the event. The user can also view the attendees of the event and only the invited or creator can view the private event
 *     tags: [Events]
 *     security:
 *       - cookieAuth: []
 *       - {}
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: id of the event to get details
 *     responses:
 *       200:
 *         description: Event details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventDetailsDTO'
 *       400:
 *         description: Invalid event id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "BadRequestError"
 *               message: "Invalid Event ID provided!"
 *       404:
 *         description: user does not have permission to view the event or the event does not exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "ResourceNotFound"
 *               message: "You don't have the permission to view the event or the event of id 1 does not exists!"
 */
export const eventByIdController = async (req: Request, res: Response) => {
  const userId = req.user?.id ?? null;
  const eventId = Number(req.params.id);

  if (!eventId || isNaN(eventId)) {
    logger.error("Invalid Event ID provided for fetching event details", { eventId: req.params.id }, true);
    throw new BadRequestError("Invalid Event ID provided!");
  }

  logger.info(`Fetching details for event of id ${eventId} for user of id ${userId ?? "Guest"}`, null, true);
  const event = await getEventWithDetailsById(eventId, userId);

  res.status(200).send(event);
};

/**
 * @openapi
 * /events/{id}:
 *   delete:
 *     summary: Delete an event
 *     description: Delete an event by its id. Only the creator of the event can delete their event!
 *     tags: [Events]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID of the event to delete
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Event of id 1 deleted!"
 *       400:
 *         description: Invalid event ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "BadRequestError"
 *               message: "Invalid Event ID provided!"
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "AuthError"
 *               message: "Access token was not provided!"
 *       404:
 *         description: Event not found or user is not the creator
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "ResourceNotFound"
 *               message: "You don't have permission to delete the event or the event of id 1 does not exists!"
 */
export const deleteEventController = async (req: Request, res: Response) => {
  const eventId = Number(req.params.id);

  if (!eventId || isNaN(eventId)) {
    logger.error("Invalid Event id provided for deleting event", { eventId: req.params.id }, true);
    throw new BadRequestError("Invalid Event ID provided!");
  }

  if (!req.user || !req.user.id) {
    logger.error("Unauthorized attempt to delete event", { eventId, user: req.user }, true);
    throw new NotFoundError(
      `You don't have permission to delete the event or the event of id ${eventId} does not exists!`,
    );
  }

  logger.info(`Attempting to delete event of id ${eventId} for user of id ${req.user.id}`, null, true);
  await deleteEvent(eventId, req.user.id);

  res.status(200).send({ message: `Event of id ${eventId} deleted!` });
};

/**
 * @openapi
 * /events/{id}:
 *   patch:
 *     summary: Update an event
 *     description: Make some updates to the event. You can send one field to update or update the whole event fields.
 *     tags: [Events]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 73
 *         description: ID of the event to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateEventInput'
 *           example:
 *             name: "Hackathon organized by the Government is now postponed to 27th!"
 *             location: "Tundikhel, Kathmandu"
 *             eventDate: "2026-06-27T05:31:12.550Z"
 *             isPrivate: true
 *             tagIds: [3, 6]
 *     responses:
 *       200:
 *         description: Event updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 event:
 *                   $ref: '#/components/schemas/EventDetailsDTO'
 *             example:
 *               message: "Event of ID 73 updated successfully!"
 *               event:
 *                 event_id: 73
 *                 event_name: "Hackathon organized by the Government is now postponed to 27th!"
 *                 description: "The annual Hackathon organized by the Government is now even bigger with more sponsors than last year!"
 *                 location: "Tundikhel, Kathmandu"
 *                 is_private: true
 *                 event_date: "2026-06-27T05:31:12.550Z"
 *                 created_at: "2026-06-17T08:07:19.830Z"
 *                 creator_id: 1
 *                 creator_name: "Rajesh Hamal"
 *                 category_id: 1
 *                 category_name: "Technology"
 *                 tags:
 *                   - id: 3
 *                     name: "Workshop"
 *                   - id: 6
 *                     name: "Hackathon"
 *                 members: []
 *       400:
 *         description: Invalid event ID or request body
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "BadRequestError"
 *               message: "Invalid Event ID provided!"
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "AuthError"
 *               message: "Access token was not provided!"
 *       403:
 *         description: User is not the event creator
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "ForbiddenError"
 *               message: "User is not allowed to update other's event!"
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "ResourceNotFound"
 *               message: "You don't have permission to update the event or the event of id 73 does not exists!"
 */
export const updateEventController = async (req: Request, res: Response) => {
  const eventId = Number(req.params.id);

  if (!eventId || isNaN(eventId)) {
    logger.error("Invalid Event ID provided for updating event", { eventId: req.params.id }, true);
    throw new BadRequestError("Invalid Event ID provided!");
  }

  if (!req.user || !req.user.id) {
    logger.error("Unauthorized attempt to update event", { eventId, user: req.user }, true);
    throw new NotFoundError(
      `You don't have permission to update the event or the event of id ${eventId} does not exists!`,
    );
  }

  const data: UpdateEventInput = updateEventSchema.parse(req.body);

  logger.info(
    `Attempting to update event of id ${eventId} for user of id ${req.user.id} with data ${JSON.stringify(data)}`,
    null,
    true,
  );
  const updatedEvent = await updateEventByItsId(eventId, req.user.id, data);

  res.status(200).send({ message: `Event of ID ${eventId} updated successfully!`, event: updatedEvent });
};

/**
 * @openapi
 * /events:
 *   get:
 *     summary: Filter and list events
 *     description: Returns a list of events with the filters applied. If authenticated, private events the current user is a member of are also included.
 *     tags: [Events]
 *     security:
 *       - cookieAuth: []
 *       - {}
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of events per page
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [upcoming, past, all]
 *           default: upcoming
 *         description: Filter events by timeframe
 *         example: upcoming
 *       - in: query
 *         name: isPrivate
 *         schema:
 *           type: boolean
 *         description: Filter by event being private or not. You can also view other's private event if you are invited. Send it as true.
 *         example: false
 *       - in: query
 *         name: tagIds
 *         schema:
 *           type: string
 *         description: List of tag ids in a comma separated values. If any event has any of the tags, it will be sent back to the user.
 *         example: "1,3,9"
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: Filter by category id
 *         example: 2
 *       - in: query
 *         name: createdBy
 *         schema:
 *           type: integer
 *         description: Filter events created by a specific user id
 *         example: 1
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         description: Events after the provided date
 *         example: "2026-04-01"
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         description: Events before the provided date
 *         example: "2026-06-29"
 *     responses:
 *       200:
 *         description: Paginated list of filtered events
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedEvents'
 *             examples:
 *               filterByTags:
 *                 summary: Filter by tag ids
 *                 value:
 *                   totalEvents: 3
 *                   page: 1
 *                   limit: 10
 *                   totalPages: 1
 *                   events:
 *                     - eventId: 1
 *                       eventName: "Deno - Tech Conference by Keanu Reeves"
 *                       description: "You might not have expected this but Rajesh Hamal and Keanu Reeves is teaming up to give a conference about Deno."
 *                       location: "New Road, Kathmandu"
 *                       isPrivate: false
 *                       eventDate: "2026-06-19T03:48:05.996Z"
 *                       createdAt: "2026-06-14T09:32:40.465Z"
 *                       creatorId: 2
 *                       creatorName: "Keanu Reeves"
 *                       categoryId: 2
 *                       categoryName: "Technology"
 *                       tags: ["Conference"]
 *               filterByDateRange:
 *                 summary: Filter by date range
 *                 value:
 *                   totalEvents: 5
 *                   page: 1
 *                   limit: 10
 *                   totalPages: 1
 *                   events:
 *                     - eventId: 4
 *                       eventName: "Hackathon 2026"
 *                       description: "Annual hackathon event"
 *                       location: "Tundikhel, Kathmandu"
 *                       isPrivate: false
 *                       eventDate: "2026-05-15T09:00:00.000Z"
 *                       createdAt: "2026-04-01T09:32:40.465Z"
 *                       creatorId: 1
 *                       creatorName: "Rajesh Hamal"
 *                       categoryId: 7
 *                       categoryName: "Technology"
 *                       tags: ["Hackathon"]
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "BadRequestError"
 *               message: "Invalid request query provided!"
 */
export const filterEventsController = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  if (isNaN(page) || isNaN(limit)) {
    logger.error("Invalid query parameters for filtering events", req.query, true);
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

  logger.info(
    `Filtering events for user of id ${userId ?? "Guest"} with filters ${JSON.stringify(filters)}`,
    null,
    true,
  );
  const events = await filterEventsByTagsAndEventType(userId, limit, page, filters);

  res.status(200).send(events);
};

/**
 * @openapi
 * /events/{id}/join:
 *   post:
 *     summary: Join an event
 *     description: >
 *       A user can join an event. If the event is private, they first need to be invited.
 *     tags: [Events]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: event id to join
 *     responses:
 *       200:
 *         description: Successfully joined the event
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "You joined the event!"
 *       400:
 *         description: Invalid event id or user is already part of the event
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               invalidId:
 *                 summary: Invalid event ID
 *                 value:
 *                   error: "BadRequestError"
 *                   message: "Invalid Event ID provided!"
 *               alreadyJoined:
 *                 summary: User already joined
 *                 value:
 *                   error: "BadRequestError"
 *                   message: "You are already part of the event!"
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "AuthError"
 *               message: "Access token was not provided!"
 *       403:
 *         description: The event is private and the has not been invited.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "ForbiddenError"
 *               message: "This is a private event. You must be invited first to join!"
 *       404:
 *         description: Event not found or user does not have permission to join
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "ResourceNotFound"
 *               message: "You don't have permission to join the event or the event of id 1 does not exists!"
 */
export const joinEventController = async (req: Request, res: Response): Promise<void> => {
  const eventId = Number(req.params.id);

  if (!eventId || isNaN(eventId)) {
    logger.error("Invalid Event id provided for joining event", { eventId: req.params.id }, true);
    throw new BadRequestError("Invalid Event ID provided!");
  }

  if (!req.user || !req.user.id) {
    logger.error("Unauthorized attempt to join event", { eventId, user: req.user }, true);
    throw new NotFoundError(
      `You don't have permission to join the event or the event of id ${eventId} does not exists!`,
    );
  }

  logger.info(`User of id ${req.user.id} attempting to join event of id ${eventId}`, null, true);
  await joinUserToEvent(eventId, req.user.id);

  res.status(200).send({ message: "You joined the event!" });
};

/**
 * @openapi
 * /events/{id}/invite:
 *   post:
 *     summary: Invite a user to an event
 *     description: >
 *       The event creator can invite members to the event.
 *     tags: [Events]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: event id to invite the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInviteInput'
 *           example:
 *             email: "keanureeves@email.com"
 *     responses:
 *       200:
 *         description: User invited successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Invited Keanu Reeves successfully!"
 *       400:
 *         description: Invalid event ID or user is already invited or part of the event
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               invalidId:
 *                 summary: Invalid event ID
 *                 value:
 *                   error: "BadRequestError"
 *                   message: "Invalid Event ID provided!"
 *               alreadyInvited:
 *                 summary: User already invited
 *                 value:
 *                   error: "BadRequestError"
 *                   message: "Keanu Reeves is already invited!"
 *               alreadyMember:
 *                 summary: User already a member
 *                 value:
 *                   error: "BadRequestError"
 *                   message: "Keanu Reeves is already part of the event!"
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "AuthError"
 *               message: "Access token was not provided!"
 *       403:
 *         description: User is not the event creator
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "AuthError"
 *               message: "Only the event creator has the permission to invite members!"
 *       404:
 *         description: Event not found or invited user does not exist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               eventNotFound:
 *                 summary: Event not found
 *                 value:
 *                   error: "ResourceNotFound"
 *                   message: "You don't have permission to invite other users or the event of id 1 does not exists!"
 *               userNotFound:
 *                 summary: Invited user not found
 *                 value:
 *                   error: "ResourceNotFound"
 *                   message: "The user of the provided email: keanureeves@email.com does not exists!"
 */
export const inviteUserToEventController = async (req: Request, res: Response) => {
  const eventId = Number(req.params.id);

  if (!eventId || isNaN(eventId)) {
    logger.error("Invalid Event id provided for inviting user to event", { eventId: req.params.id }, true);
    throw new BadRequestError("Invalid Event ID provided!");
  }

  if (!req.user || !req.user.id) {
    logger.error("Unauthorized attempt to invite user to event", { eventId, user: req.user }, true);
    throw new NotFoundError(
      `You don't have permission to invite other users or the event of id ${eventId} does not exists!`,
    );
  }

  const userBody: UserInviteInput = userInviteSchema.parse(req.body);

  logger.info(
    `User of id ${req.user.id} attempting to invite user with email ${userBody.email} to event of id ${eventId}`,
    null,
    true,
  );
  const invitedUser = await inviteUserToEvent(eventId, req.user.id, userBody.email);

  res.status(200).send({ message: `Invited ${invitedUser.full_name} successfully!` });
};

/**
 * @openapi
 * /events/mine:
 *   get:
 *     summary: Get current user's created events
 *     description: Returns a paginated list of all events created by the currently authenticated user. Supports the same filters as the main events endpoint.
 *     tags: [Events]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of events per page
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [upcoming, past, all]
 *           default: upcoming
 *         description: Send upcoming if you want the events on future
 *         example: upcoming
 *       - in: query
 *         name: isPrivate
 *         schema:
 *           type: boolean
 *         description: Send true if you want to view your private events
 *         example: true
 *       - in: query
 *         name: tagIds
 *         schema:
 *           type: string
 *         description: The tag ids are comma separated. If any event has any of the tags, it will be sent back to the user.
 *         example: "1,3,9"
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: Filter by category id
 *         example: 2
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         description: Events after the provided date
 *         example: "2026-04-01"
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         description: Events before the provided date
 *         example: "2026-06-29"
 *     responses:
 *       200:
 *         description: List list of events created by the current user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedEvents'
 *             example:
 *               totalEvents: 2
 *               page: 1
 *               limit: 10
 *               totalPages: 1
 *               events:
 *                 - eventId: 1
 *                   eventName: "Science fair for school students!"
 *                   description: "You will see more than bulb wired to a battery in this event!"
 *                   location: "New Baneshwor, Kathmandu"
 *                   isPrivate: false
 *                   eventDate: "2026-06-20T03:48:05.996Z"
 *                   createdAt: "2026-06-18T09:32:40.465Z"
 *                   creatorId: 1
 *                   creatorName: "Rajesh Hamal"
 *                   categoryId: 3
 *                   categoryName: "Science"
 *                   tags: ["Fair", "Workshop"]
 *                 - eventId: 5
 *                   eventName: "Hackathon 2026"
 *                   description: "Annual hackathon event"
 *                   location: "Tundikhel, Kathmandu"
 *                   isPrivate: true
 *                   eventDate: "2026-07-01T09:00:00.000Z"
 *                   createdAt: "2026-06-10T09:32:40.465Z"
 *                   creatorId: 1
 *                   creatorName: "Rajesh Hamal"
 *                   categoryId: 1
 *                   categoryName: "Technology"
 *                   tags: ["Hackathon"]
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "BadRequestError"
 *               message: "Invalid request query provided!"
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "AuthError"
 *               message: "Access token was not provided!"
 */
export const getAllEventsOfUserController = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  if (isNaN(page) || isNaN(limit)) {
    logger.error("Invalid query parameters for fetching user's events", req.query, true);
    throw new BadRequestError("Invalid request query provided!");
  }

  //we will use it after autheticated middleware, so req.user.id will not be empty
  //but still having checks like in the above functions
  if (!req.user || !req.user.id) {
    logger.error("Unauthorized attempt to fetch user's events", { user: req.user }, true);
    throw new NotFoundError(`You need to login first!`);
  }

  const parsedFilters = eventFilterSchema.parse(req.query);
  const filters: EventFilters = {
    isPrivate: parsedFilters.isPrivate,
    tagIds: parsedFilters.tagIds,
    createdBy: req.user.id,
    categoryId: parsedFilters.categoryId,
    timeframe: parseTimeFrame(parsedFilters.timeframe),
    from: parsedFilters.from,
    to: parsedFilters.to,
  };

  logger.info(
    `Fetching events created by user of id ${req.user.id} with filters ${JSON.stringify(filters)}`,
    null,
    true,
  );
  const events = await filterEventsByTagsAndEventType(req.user.id, limit, page, filters);

  res.status(200).send(events);
};

/**
 * @openapi
 * /events/joined:
 *   get:
 *     summary: Get list of the events the current user has joined
 *     description: >
 *       Lists all the events that the current user has joined. If the user has been invited to the event, it retuns the event as well.
 *     tags: [Events]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of events per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [accepted, invited, declined]
 *         description: Filter the events depending upon the user's response to the invitation
 *         example: accepted
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [upcoming, past, all]
 *           default: upcoming
 *         description: Send upcoming if you want the events on future
 *         example: upcoming
 *       - in: query
 *         name: isPrivate
 *         schema:
 *           type: boolean
 *         description: Send true if you want to view your private events
 *         example: true
 *       - in: query
 *         name: tagIds
 *         schema:
 *           type: string
 *         description: The tag ids are comma separated. If any event has any of the tags, it will be sent back to the user.
 *         example: "1,3,9"
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: Filter by category id
 *         example: 2
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         description: Events after the provided date
 *         example: "2026-04-01"
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         description: Events after the provided date
 *         example: "2026-06-29"
 *     responses:
 *       200:
 *         description: Paginated list of events the current user has joined
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedEvents'
 *             examples:
 *               accepted:
 *                 summary: Events user has accepted
 *                 value:
 *                   totalEvents: 2
 *                   page: 1
 *                   limit: 10
 *                   totalPages: 1
 *                   events:
 *                     - eventId: 2
 *                       eventName: "Another Event by the Government"
 *                       description: "We are inviting many members to the event."
 *                       location: "Babbarmahal, Kathmandu"
 *                       isPrivate: false
 *                       eventDate: "2026-06-19T03:48:05.996Z"
 *                       createdAt: "2026-06-14T09:32:40.465Z"
 *                       creatorId: 2
 *                       creatorName: "Keanu Reeves"
 *                       categoryId: 1
 *                       categoryName: "Arts"
 *                       tags: ["Show", "Networking"]
 *               invited:
 *                 summary: Events user has been invited to but not responded
 *                 value:
 *                   totalEvents: 1
 *                   page: 1
 *                   limit: 10
 *                   totalPages: 1
 *                   events:
 *                     - eventId: 5
 *                       eventName: "Private Workshop"
 *                       description: "An exclusive private workshop"
 *                       location: "Thamel, Kathmandu"
 *                       isPrivate: true
 *                       eventDate: "2026-07-01T09:00:00.000Z"
 *                       createdAt: "2026-06-10T09:32:40.465Z"
 *                       creatorId: 3
 *                       creatorName: "Rajesh Hamal"
 *                       categoryId: 2
 *                       categoryName: "Workshop"
 *                       tags: ["workshop"]
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "BadRequestError"
 *               message: "Invalid request query provided!"
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "AuthError"
 *               message: "Access token was not provided!"
 */
export const getUserJoinedEventsController = async (req: Request, res: Response): Promise<void> => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  if (isNaN(page) || isNaN(limit)) {
    logger.error("Invalid query parameters for fetching user's joined events", req.query, true);
    throw new BadRequestError("Invalid request query provided!");
  }

  if (!req.user || !req.user.id) {
    logger.error("Unauthorized attempt to fetch user's joined events", { user: req.user }, true);
    throw new NotFoundError("You need to login first!");
  }

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
  const status = parseMemberStatus(req.query.status);

  logger.info(
    `Fetching events joined by user of id ${req.user.id} with filters ${JSON.stringify(filters)} and status ${status}`,
    null,
    true,
  );
  const events = await getUserMemberEvents(req.user.id, page, limit, filters, status);

  res.status(200).send(events);
};

/**
 * @openapi
 * /events/{id}/respond:
 *   patch:
 *     summary: Respond to an event invitation
 *     description: >
 *       Respond to an invitation of an event. You can Accept/Decline the invitation.
 *     tags: [Events]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Event id of the invitation to respond
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserResponseToInvitation'
 *           example:
 *             response: "accepted"
 *     responses:
 *       200:
 *         description: Response recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               accepted:
 *                 summary: User accepted the invitation
 *                 value:
 *                   message: "You have accepted the invitation!"
 *               declined:
 *                 summary: User declined the invitation
 *                 value:
 *                   message: "You have declined the invitation!"
 *       400:
 *         description: Invalid event id or request body
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ZodError'
 *             examples:
 *               invalidId:
 *                 summary: Invalid event id
 *                 value:
 *                   error: "BadRequestError"
 *                   message: "Invalid Event ID provided!"
 *               invalidResponse:
 *                 summary: Invalid response value
 *                 value:
 *                   error: "ValidationError"
 *                   message: "Invalid request body"
 *                   fields:
 *                     response: ["Invalid enum value. Expected 'accepted' | 'declined'"]
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "AuthError"
 *               message: "Access token was not provided!"
 *       403:
 *         description: User is the organizer of the event
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "ForbiddenError"
 *               message: "You are the organizer of this event!"
 *       404:
 *         description: Event not found or user has not been invited
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               eventNotFound:
 *                 summary: Event not found
 *                 value:
 *                   error: "ResourceNotFound"
 *                   message: "You need to login first!"
 *               notInvited:
 *                 summary: User has not been invited
 *                 value:
 *                   error: "ResourceNotFound"
 *                   message: "You have not been invited to this event!"
 */
export const respondToEventInvitationController = async (req: Request, res: Response): Promise<void> => {
  const eventId = Number(req.params.id);

  if (!eventId || isNaN(eventId)) {
    logger.error("Invalid Event id provided for responding to invitation", { eventId: req.params.id }, true);
    throw new BadRequestError("Invalid Event ID provided!");
  }

  if (!req.user || !req.user.id) {
    logger.error("Unauthorized attempt to respond to event invitation", { eventId, user: req.user }, true);
    throw new NotFoundError("You need to login first!");
  }

  const userResponse: UserResponseToInvitation = userResponseToInvitation.parse(req.body);

  await respondToEventInvitation(eventId, req.user.id, userResponse.response);

  logger.info(
    `User of id ${req.user.id} responded to event invitation for event of id ${eventId}`,
    { eventId, user: req.user },
    true,
  );

  const messageToSend =
    userResponse.response === "accepted"
      ? "You have accepted the invitation!"
      : "You have declined the invitation!";

  res.status(200).send({ message: messageToSend });
};
