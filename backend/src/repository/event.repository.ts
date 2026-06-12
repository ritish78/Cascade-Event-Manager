import db from "src/db";
import { Event, EventDetails, EventRow, PaginatedEvents } from "../types/event.types";
import { Knex } from "knex";
import { UpdateEventInput } from "src/schema/event.schema";

type QueryBuilder = Knex.Transaction | Knex;

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
  trx: QueryBuilder = db,
): Promise<Event> => {
  const [event] = await trx("events")
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
  trx: QueryBuilder = db,
): Promise<void> => {
  await trx("event_members").insert({
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
export const insertEventTags = async (
  eventId: number,
  tagIds: number[],
  trx: QueryBuilder = db,
): Promise<void> => {
  //We might receive many tag id at once
  const rowsToAdd = tagIds.map((tagId) => ({
    event_id: eventId,
    tag_id: tagId,
  }));

  await trx("event_tags").insert(rowsToAdd);
};

/**
 * @param userId
 * @param eventName
 * @param eventDescription
 * @param eventLocation
 * @param isPrivate
 * @param categoryId
 * @param eventDate
 * @param invitedBy
 * @param status
 * @param tagIds
 * @returns
 */
export const insertEventWithMembersAndTags = (
  userId: number,
  eventName: string,
  eventDescription: string,
  eventLocation: string,
  isPrivate: Boolean,
  categoryId: number,
  eventDate: Date,
  invitedBy: number,
  status: string,
  tagIds: number[],
) => {
  return db.transaction(async (trx) => {
    const event = await insertEvent(
      userId,
      eventName,
      eventDescription,
      eventLocation,
      isPrivate,
      categoryId,
      eventDate,
      trx,
    );

    await insertEventMember(event.id, userId, invitedBy, status, trx);

    if (tagIds.length > 0) {
      await insertEventTags(event.id, tagIds, trx);
    }

    return event;
  });
};

/**
 * @param eventId               number - id of the event to search
 * @returns                     Event | null
 */
export const findEventById = async (eventId: number, trx: QueryBuilder = db): Promise<Event | null> => {
  const eventFromDatabase = await trx<Event>("events").where({ id: eventId }).first();

  return eventFromDatabase ?? null;
};

/**
 * @param userId                number | null - id of the user who might be logged in. if not logged in, we only display not private events
 * @param limit                 number - number of events to fetch
 * @param page                  number - number of pages that we are in
 * @param upcoming              boolean - default true - true if we want results for future events. false if past.
 * @returns
 */
const buildEventsFutureOrPastQuery = (
  userId: number | null,
  limit: number,
  page: number,
  upcoming: boolean = true,
) => {
  const offset = (page - 1) * limit;
  /**
   * The SQL query that I want to implement:
   * 
   SELECT e.id AS event_id, e.name AS event_name, e.description, e.location, e.is_private, e.created_by AS creator_id, e.category_id, e.event_date, 
        u.full_name AS creator_name,
        c.id AS category_id, c.name AS category_name,
        COUNT(*) OVER() AS events_count,    //added later
        ARRAY(SELECT t.name FROM event_tags t JOIN t ON t.id = et.tag_id WHERE et.event_id = e.id) AS tags //added later
    FROM EVENTS e
    INNER JOIN users as u 
    ON e.created_by = u.id 
    LEFT JOIN categories as c ON c.id = e.category_id
    LEFT JOIN event_members AS em ON em.event_id = e.id
    WHERE event_date >= CURRENT_DATE 
    AND (em.user_id = 8 OR e.is_private = false)
    ORDER BY e.event_date ASC
    LIMIT 10
    OFFSET 0;

    Planning:
        Buffers: shared hit=334
        Planning Time: 4.887 ms
        Execution Time: 0.917 ms


    * And since, we are not selecting anything from the joined event_members table, we could
    * use EXISTS to make it faster. There could be many many members for a particular event
    * and we don't want Postgres to create JOINS for each row as it would take a bit of time
    * and resources. We just want to check if the user is a part of the event, i.e. in
    * event_members table, does the current user's id (event_members.user_id) here as em.user_id
    * exists for the current logged in user. We don't care about other user_id for the same event
    
    
    SELECT e.id AS event_id, e.name AS event_name, e.description, e.location, e.is_private, e.created_by AS creator_id, e.category_id, e.event_date, 
        u.full_name AS creator_name,
        c.id AS category_id, c.name AS category_name
    FROM EVENTS e
    INNER JOIN users as u 
    ON e.created_by = u.id 
    LEFT JOIN categories as c ON c.id = e.category_id
    WHERE event_date >= CURRENT_DATE 
    AND (e.is_private = false OR EXISTS (SELECT 1 FROM event_members em WHERE em.event_id = e.id AND em.user_id = 7))
    ORDER BY e.event_date ASC;

    Planning:
        Buffers: shared hit=327
        Planning Time: 4.850 ms
        Execution Time: 0.489 ms
   */

  return db("events as e")
    .join("users AS u", "e.created_by", "u.id")
    .leftJoin("categories AS c", "c.id", "e.category_id")
    .select(
      "e.id AS event_id",
      "e.name AS event_name",
      "e.description",
      "e.location",
      "e.is_private",
      "e.event_date",
      "e.created_at",
      "u.full_name AS creator_name",
      "c.id AS category_id",
      "c.name AS category_name",
      db.raw("COUNT(*) OVER() AS events_count"),
      db.raw(
        `ARRAY(SELECT t.name FROM event_tags et JOIN tags t ON t.id = et.tag_id WHERE et.event_id = e.id) AS tags`,
      ),
    )
    .where("e.event_date", upcoming ? ">=" : "<", db.raw("CURRENT_DATE"))
    .where((builder) => {
      builder.where("e.is_private", false);

      if (userId) {
        builder.orWhereExists(
          db("event_members as em")
            .where("em.event_id", db.ref("e.id"))
            .where("em.user_id", userId)
            .select(db.raw("1")),
        );
      }
    })
    .orderBy("e.event_date", upcoming ? "asc" : "desc")
    .limit(limit)
    .offset(offset);
};

/**
 * @param userId                number | null - id of the user who might be logged in. if not logged in, we only display not private events
 * @param limit                 number - number of events to fetch
 * @param page                  number - number of pages that we are in
 * @returns
 */
export const findUpcomingEvents = async (
  userId: number | null,
  limit: number,
  page: number,
): Promise<PaginatedEvents> => {
  const events: EventRow[] = await buildEventsFutureOrPastQuery(userId, limit, page);
  console.log(buildEventsFutureOrPastQuery(userId, limit, page).toSQL().toNative());
  const totalEvents = Number(events[0]?.events_count ?? 0);

  return { totalEvents, page, limit, totalPages: Math.ceil(totalEvents / limit), events };
};

/**
 * @param userId                number | null - id of the user who might be logged in. if not logged in, we only display not private events
 * @param limit                 number - number of events to fetch
 * @param page                  number - number of pages that we are in
 * @returns
 */
export const findPastEvents = async (
  userId: number | null,
  limit: number,
  page: number,
): Promise<PaginatedEvents> => {
  const events: EventRow[] = await buildEventsFutureOrPastQuery(userId, limit, page, false);
  const totalEvents = Number(events[0]?.events_count ?? 0);

  return { totalEvents, page, limit, totalPages: Math.ceil(totalEvents / limit), events };
};

/**
 * @param eventId               number - id of the event to fetch details
 * @param userId                number | null - id of the user if logged in
 * @returns
 */
export const findEventDetailsById = async (eventId: number, userId: number | null): Promise<EventDetails> => {
  const event = await db("events as e")
    .join("users as u", "e.created_by", "u.id")
    .leftJoin("categories as c", "c.id", "e.category_id")
    .select(
      "e.id AS event_id",
      "e.name AS event_name",
      "e.description",
      "e.location",
      "e.is_private",
      "e.event_date",
      "e.created_at",
      "u.full_name AS creator_name",
      "c.id AS category_id",
      "c.name AS category_name",
      db.raw(
        `ARRAY(SELECT t.name FROM event_tags et JOIN tags t ON t.id = et.tag_id WHERE et.event_id = e.id) AS tags`,
      ),
    )
    .where("e.id", eventId)
    .where((builder) => {
      builder.where("e.is_private", false);

      if (userId) {
        builder.orWhereExists(
          db("event_members as em")
            .where("em.event_id", db.ref("e.id"))
            .where("em.user_id", userId)
            .select(db.raw("1")),
        );
      }
    })
    .first();

  return event ?? null;
};

/**
 * @param eventId           number - id of the event to delete
 */
export const deleteEventById = async (eventId: number): Promise<void> => {
  await db("events").where({ id: eventId }).delete();
  //OR we could write a query to delete eventId where created_by column has userId
  //this would elimintate first searching if the event exists and then checking
  //if the current user id matches created_by. We just simply send a delete
  //to postgres. we would have less query but we wouldn't know if the user did
  //not have permission to delete the event or if the event did not exists
  //as .delete() returns 1 if deleted or 0 if not deleted. We wouldn't know the
  //difference between the event not existing and the user not having permission
  //await db("events").where({ id: eventId, created_by: userId }).delete();
};

/**
 * @param eventId           number - id of the event to update
 * @param data              Partial Event to update
 * @param trx               QueryBuilder (Knex Transaction) | db - db by default
 * @returns
 */
export const updateEventById = async (
  eventId: number,
  data: Partial<Event>,
  trx: QueryBuilder = db,
): Promise<void> => {
  await trx("events")
    .where({ id: eventId })
    .update({ ...data, updated_at: new Date() });
};

/**
 * @param eventId       number - id of the event to replace tags
 * @param tagIds        number[] - ids of the tag to replace
 * @param trx           QueryBuilder - db by default
 */
export const replaceTagsOfEvent = async (
  eventId: number,
  tagIds: number[],
  trx: QueryBuilder = db,
): Promise<void> => {
  //first, we are removing all tags of the event we could do a check to see what are the
  //tags of the event then check if the id/name of the tag matches the tags supplied
  //by the user. If it matches, we skip it and if it does not matches, then we insert
  //another row to create new tags. But, we are going to remove all tags of the event
  //first if event is provided in PATCH request body. Then we will add all tags to the event_tags table.
  //If the event has these tags: 1, 3, 6 and the user wants to add a new tag
  //PATCH request with tags: [1, 3, 6, 2]
  //and if the user wants to delete the tag of id 3, then
  //PATCH request with tags: [1, 6, 2].
  //Sending a path request with tags: [] will delete all tags.
  //This is the case for the tags only. A user can edit other with
  await trx("event_tags").where({ event_id: eventId }).delete();

  //Finally adding all the tags to the events
  //we need to insert like this { event_id: 1, tag_id: 1 } so we need to map to format it
  if (tagIds.length > 0) {
    const rowsToAdd = tagIds.map((tagId) => ({
      event_id: eventId,
      tag_id: tagId,
    }));

    await trx("event_tags").insert(rowsToAdd);
  }
};

/**
 * @param eventId       number - id of the event to update with tags
 * @param userId        number - id of the user
 * @param data          UpdateEventInput
 */
export const updateEventWithTags = (
  eventId: number,
  userId: number,
  data: UpdateEventInput,
): Promise<EventDetails> => {
  return db.transaction(async (trx) => {
    const eventData: Partial<Event> = {};

    if (data.name) eventData.name = data.name;
    if (data.description) eventData.description = data.description;
    if (data.location) eventData.location = data.location;
    //isPrivate is boolean so, we can't just check with if (data.isPrivate)
    if (data.isPrivate !== undefined) eventData.is_private = data.isPrivate;
    if (data.categoryId) eventData.category_id = data.categoryId;
    if (data.eventDate !== undefined) eventData.event_date = data.eventDate;

    await updateEventById(eventId, eventData, trx);

    if (data.tags !== undefined) {
      await replaceTagsOfEvent(eventId, data.tags, trx);
    }

    return findEventDetailsById(eventId, userId);
  });
};
