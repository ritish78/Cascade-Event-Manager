import {
  findEventById,
  insertEvent,
  insertEventMember,
  insertEventTags,
  insertEventWithMembersAndTags,
} from "src/repository/event.repository";
import { NotFoundError } from "src/utils/error";
import { Event } from "src/types/event.types";

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
  await insertEventMember(event.id, userId, userId, "accepted");

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
