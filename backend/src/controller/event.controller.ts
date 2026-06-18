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
} from "src/schema/event.schema";
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
} from "src/services/event.services";
import { EventFilters } from "src/types/event.types";
import { AuthError, BadRequestError, NotFoundError } from "src/utils/error";
import { parseMemberStatus, parseTimeFrame } from "../utils/parseTimeFrame"; //was working but somehow needed to change the import from

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
    throw new BadRequestError("Invalid request query provided!");
  }

  const userId = req.user?.id ?? null;

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
    throw new BadRequestError("Invalid request query provided!");
  }

  const userId = req.user?.id ?? null;

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
    throw new BadRequestError("Invalid Event ID provided!");
  }

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

/**
 * @route               /api/v1/events/joined
 * @method              GET
 * @access              authenticated
 */
export const getUserJoinedEventsController = async (req: Request, res: Response): Promise<void> => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  if (isNaN(page) || isNaN(limit)) {
    throw new BadRequestError("Invalid request query provided!");
  }

  if (!req.user || !req.user.id) {
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

  const events = await getUserMemberEvents(req.user.id, page, limit, filters, status);

  res.status(200).send(events);
};

export const respondToEventInvitationController = async (req: Request, res: Response): Promise<void> => {
  const eventId = Number(req.params.id);

  if (!eventId || isNaN(eventId)) {
    throw new BadRequestError("Invalid Event ID provided!");
  }

  if (!req.user || !req.user.id) {
    throw new NotFoundError("You need to login first!");
  }

  const userResponse: UserResponseToInvitation = userResponseToInvitation.parse(req.body);

  await respondToEventInvitation(eventId, req.user.id, userResponse.response);

  const messageToSend =
    userResponse.response === "accepted"
      ? "You have accepted the invitation!"
      : "You have declined the invitation!";

  res.status(200).send({ message: messageToSend });
};
