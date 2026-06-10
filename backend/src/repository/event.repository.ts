import db from "src/db";
import { Event } from "../types/event.types";

/**
 * @param userId                number - id of the user who created the event
 * @param eventName             string - name/title of the event
 * @param eventDescription      string - description of the event
 * @param eventLocation         string - where event is going to take place
 * @param isPrivate             boolean - true if private
 * @param categoryId            number - id of the category of event
 * @param eventDate             Date - date of the event
 * @returns                     Event that is added
 */
export const insertEvent = async (
  userId: number,
  eventName: string,
  eventDescription: string,
  eventLocation: string,
  isPrivate: Boolean,
  categoryId: number,
  eventDate: Date,
): Promise<Event> => {
  const [event] = await db("events")
    .insert({
      name: eventName,
      description: eventDescription,
      location: eventLocation,
      created_by: userId,
      category_id: categoryId,
      is_private: isPrivate,
      event_date: new Date(eventDate),
    })
    .returning("*");

  return event;
};

/**
 * @param eventId               number - id of the event to add members
 * @param userId                number - id of the memeber to add
 * @param invitedBy             number - id of the user who invited userId
 * @param status                string - invited | accepted | declined
 */
export const insertEventMember = async (
  eventId: number,
  userId: number,
  invitedBy: number,
  status: string,
): Promise<void> => {
  await db("event_members").insert({
    event_id: eventId,
    user_id: userId,
    invited_by: invitedBy,
    status: status,
  });
};

/**
 * @param eventId               number - id of the event to add tags
 * @param tagIds                numbers[] - ids of the tags to add
 */
export const insertEventTags = async (eventId: number, tagIds: number[]): Promise<void> => {
  //We might receive many tag id at once
  const rowsToAdd = tagIds.map((tagId) => ({
    event_id: eventId,
    tag_id: tagId,
  }));

  await db("event_tags").insert(rowsToAdd);
};

/**
 * @param eventId               number - id of the event to search
 * @returns                     Event | null
 */
export const findEventById = async (eventId: number): Promise<Event | null> => {
  const eventFromDatabase = await db<Event>("events").where({ id: eventId }).first();

  return eventFromDatabase ?? null;
};
