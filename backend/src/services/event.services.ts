import {
  deleteEventById,
  filterEvents,
  findEventById,
  findEventDetailsById,
  findPastEvents,
  findUpcomingEvents,
  findUserIsPartOfEvent,
  findUserMemberEvents,
  insertEvent,
  insertEventMember,
  insertEventTags,
  insertEventWithMembersAndTags,
  updateEventWithTags,
  updateUserEventStatus,
} from "src/repository/event.repository";
import { AuthError, BadRequestError, ForbiddenError, NotFoundError } from "src/utils/error";
import { Event, EventDetails, EventFilters, PaginatedEvents } from "src/types/event.types";
import { UpdateEventInput } from "src/schema/event.schema";
import { findUserByEmail } from "src/repository/auth.repository";
import { User } from "src/types/user.types";

export const createNewEvent = async (
  userId: number,
  eventName: string,
  eventDescription: string,
  eventLocation: string,
  isPrivate: Boolean = false,
  categoryId: number,
  eventDate: Date,
  invitedBy: number,
  status: string,
  tagIds: number[] = [],
) => {
  return insertEventWithMembersAndTags(
    userId,
    eventName,
    eventDescription,
    eventLocation,
    isPrivate,
    categoryId,
    eventDate,
    invitedBy,
    "organizer", //organizer if theuser is creating the event. "attendee" if the user accepts the event
    status,
    tagIds,
  );
};

/**
 * @param userId                number - id of the user who created the event
 * @param eventName             string - name/title of the event
 * @param eventDescription      string - description of the event
 * @param eventLocation         string - where event is going to take place
 * @param isPrivate             boolean - true if private
 * @param categoryId            number - id of the category of event
 * @param eventDate             Date - date of the event
 * @returns                     Event that is added
 * This is the previous one without using transaction. A newer function is created above
 * createNewEvent which does exactly this using transactions.
 * @deprecated
 */
export const createEvent = async (
  userId: number,
  eventName: string,
  eventDescription: string,
  eventLocation: string,
  isPrivate: Boolean = false,
  categoryId: number,
  eventDate: Date,
  tagIds: number[],
) => {
  //First we add event to the events table
  const event = await insertEvent(
    userId,
    eventName,
    eventDescription,
    eventLocation,
    isPrivate,
    categoryId,
    eventDate,
  );

  //Then we get the event id from above event and use it to add event_memebers
  //The invited_by is userId itself and we are setting "accepted" by default when
  //they have created the event.
  await insertEventMember(event.id, userId, userId, "organizer", "accepted");

  if (tagIds.length > 0) {
    await insertEventTags(event.id, tagIds);
  }

  return event;
};

/**
 * @param eventId           number - id of the event to fetch details
 * @returns                 Promise<Event>
 */
export const getEventById = async (eventId: number): Promise<Event> => {
  const event = await findEventById(eventId);

  if (!event) {
    throw new NotFoundError("Requested event not found!");
  }

  return event;
};

/**
 * @param userId                number | null - id of the user who might be logged in. if not logged in, we only display not private events
 * @param limit                 number - number of events to fetch
 * @param page                  number - number of pages that we are in
 * @returns
 */
export const getUpcomingEvents = async (
  userId: number | null,
  limit: number,
  page: number,
): Promise<PaginatedEvents> => {
  return findUpcomingEvents(userId, limit, page);
};

/**
 * @param userId                number | null - id of the user who might be logged in. if not logged in, we only display not private events
 * @param limit                 number - number of events to fetch
 * @param page                  number - number of pages that we are in
 * @returns
 */
export const getPastEvents = async (
  userId: number | null,
  limit: number,
  page: number,
): Promise<PaginatedEvents> => {
  return findPastEvents(userId, limit, page);
};

/**
 * @param eventId               number - id of the event to fetch details
 * @param userId                number - id of the user
 * @returns
 */
export const getEventWithDetailsById = async (
  eventId: number,
  userId: number | null,
): Promise<EventDetails> => {
  const event = await findEventDetailsById(eventId, userId);

  return event;
};

/**
 * @param eventId               number - id of the event to delete
 * @param userId                number - id of the user
 */
export const deleteEvent = async (eventId: number, userId: number) => {
  try {
    const event = await getEventById(eventId);

    if (event.created_by !== userId) {
      throw new ForbiddenError("User is not allowed to delete other's event!");
    }

    await deleteEventById(eventId);
  } catch (error) {
    //getEventById already throws error if event is not found but we want to have
    //same error message when there is no event or the user does not have permission
    throw new NotFoundError(
      `You don't have permission to delete the event or the event of id ${eventId} does not exists!`,
    );
  }
};

/**
 * @param eventId               number - id of the event to update
 * @param userId                number - id of the user
 * @param data                  UpdateEventInput - fields to update
 * @returns
 */
export const updateEventByItsId = async (eventId: number, userId: number, data: UpdateEventInput) => {
  const event = await getEventById(eventId);

  if (!event) {
    throw new NotFoundError(
      `You don't have permission to update the event or the event of id ${eventId} does not exists!`,
    );
  }

  if (event.created_by !== userId) {
    throw new ForbiddenError("User is not allowed to update other's event!");
  }

  const updatedEvent = await updateEventWithTags(eventId, userId, data);

  return updatedEvent;
};

/**
 * @param userId        number | null - userid if logged in and null if not
 * @param limit         number - number of events to fetch at a time
 * @param page          number - current page number that we are on
 * @param filters       EventFilters - filters applied by user
 * @returns             Promise<PaginatedEvents>
 */
export const filterEventsByTagsAndEventType = async (
  userId: number | null,
  limit: number,
  page: number,
  filters: EventFilters,
): Promise<PaginatedEvents> => {
  return filterEvents(userId, limit, page, filters);
};

/**
 * @param eventId       number - eventid for the user to join
 * @param userId        number - userid to join to the event
 * @returns             Promise<void>
 */
export const joinUserToEvent = async (eventId: number, userId: number): Promise<void> => {
  const event = await findEventById(eventId);

  if (!event) {
    throw new NotFoundError(
      `You don't have permission to join the event or the event of id ${eventId} does not exists!`,
    );
  }

  //We could add a check to see if the current user is the creator
  //event.created_by === userId
  //but we don't need to do so, because we will have another check below
  //which results in the same result.

  const isUserAlreadyPartOfEvent = await findUserIsPartOfEvent(eventId, userId);

  if (isUserAlreadyPartOfEvent) {
    if (isUserAlreadyPartOfEvent.status === "accepted") {
      throw new BadRequestError("You are already part of the event!");
    } else if (isUserAlreadyPartOfEvent.status === "invited") {
      await updateUserEventStatus(eventId, userId, "accepted");
      return;
    } else if (isUserAlreadyPartOfEvent.status === "declined") {
      await updateUserEventStatus(eventId, userId, "accepted");
      return;
    }
  }

  //after all the previous checks, a user can request to join an event even if
  //it is a private event and the user isn't invited. So, need to make another check.
  if (event.is_private) {
    throw new ForbiddenError("This is a private event. You must be invited first to join!");
  }

  await insertEventMember(eventId, userId, userId, "attendee", "accepted");
};

/**
 * @param eventId       number - id of the event to invite user
 * @param inviterId     number - id of the user who is inviting another user
 * @param email         string - email of the user to invite
 */
export const inviteUserToEvent = async (eventId: number, inviterId: number, email: string): Promise<User> => {
  const event = await findEventById(eventId);

  if (!event) {
    throw new NotFoundError(
      `You don't have permission to invite members or the event of id ${eventId} does not exists!`,
    );
  }

  //Currently, we are only providing feature for event creator to invite other members to their event
  if (event.created_by !== inviterId) {
    throw new AuthError("Only the event creator has the permission to invite memebers!");
  }

  const userToInvite = await findUserByEmail(email);

  if (!userToInvite) {
    throw new NotFoundError(`The user of the provided email: ${email} does not exists!`);
  }

  if (event.created_by === userToInvite.id) {
    throw new BadRequestError("You are already the part of the event!");
  }

  const isUserAlreadyPartOfEvent = await findUserIsPartOfEvent(eventId, userToInvite.id);

  if (isUserAlreadyPartOfEvent) {
    if (isUserAlreadyPartOfEvent.status === "accepted") {
      throw new BadRequestError(`${userToInvite.full_name} is already part of the event!`);
    } else if (isUserAlreadyPartOfEvent.status === "invited") {
      throw new BadRequestError(`${userToInvite.full_name} is already invited!`);
    } else if (isUserAlreadyPartOfEvent.status === "declined") {
      //if the user that we are inviting has declined already,
      //we can still invite them to the event again
      await updateUserEventStatus(eventId, userToInvite.id, "invited");

      return userToInvite;
    }
  }

  await insertEventMember(eventId, userToInvite.id, inviterId, "attendee", "invited");

  return userToInvite;
};

/**
 * @param userId            number- id of the user to fetch the events that they are part of
 * @param page              number - page number the user is currently in
 * @param limit             number - number of events to fetch
 * @param timeframe         upcoming | past | all
 * @param status            accepted | invited | declined
 */
export const getUserMemberEvents = async (
  userId: number,
  page: number,
  limit: number,
  timeframe: "upcoming" | "past" | "all",
  status?: "accepted" | "invited" | "declined",
) => {
  return findUserMemberEvents(userId, page, limit, timeframe, status);
};

/**
 * @param eventId       number - event id to respond
 * @param userId        number - user id of the responder
 * @param response      accepted | declined
 */
export const respondToEventInvitation = async (
  eventId: number,
  userId: number,
  response: "accepted" | "declined",
): Promise<void> => {
  const event = await findEventById(eventId);

  if (!event) {
    throw new NotFoundError(
      `You don't have permission to respond to the event of id ${eventId} does not exists!`,
    );
  }

  const userMembership = await findUserIsPartOfEvent(eventId, userId);

  if (!userMembership) {
    throw new BadRequestError("You have not been invited in this event to respond!");
  }

  //to check the user's role, we are using userMembership.role
  //we can also use userMembership.invited_by but, a user can request to join
  //an event and the row will have their userId. so, doing this easier.
  if (userMembership.role === "organizer") {
    throw new BadRequestError("You are already the organizer of this event!");
  }

  //checking both membership.status and response. We can modify it later to say
  //if userMembership.status === "accepted" && response === "declined" to
  //update the row to be declined even if the user has already accepted the invitation
  //currently, our mvp does not need that feature.
  if (userMembership.status === "accepted" && response === "accepted") {
    throw new BadRequestError("You have already accepted the invitation to the event!");
  }

  if (userMembership.status === "declined" && response === "declined") {
    throw new BadRequestError("You have already declined the inviation to the event!");
  }

  await updateUserEventStatus(eventId, userId, response);
};
