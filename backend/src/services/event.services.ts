import {
  deleteEventById,
  filterEvents,
  findEventById,
  findEventDetailsById,
  findPastEvents,
  findUpcomingEvents,
  insertEvent,
  insertEventMember,
  insertEventTags,
  insertEventWithMembersAndTags,
  updateEventWithTags,
} from "src/repository/event.repository";
import { ForbiddenError, NotFoundError } from "src/utils/error";
import { Event, EventDetails, EventFilters, PaginatedEvents } from "src/types/event.types";
import { UpdateEventInput } from "src/schema/event.schema";

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
