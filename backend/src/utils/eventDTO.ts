import {
  Event,
  EventDetails,
  EventDetailsDTO,
  EventDTO,
  EventRow,
  EventRowDTO,
  Member,
  MemberDTO,
} from "../types/event.types";

export const toEventDTO = (event: Event): EventDTO => ({
  id: event.id,
  name: event.name,
  description: event.description,
  location: event.location,
  isPrivate: event.is_private,
  createdBy: event.created_by,
  categoryId: event.category_id,
  eventDate: event.event_date,
  createdAt: event.created_at,
  updatedAt: event.updated_at,
});

export const toMemberDTO = (member: Member): MemberDTO => ({
  userId: member.user_id,
  fullName: member.full_name,
  status: member.status,
  role: member.role,
});

export const toEventDetailsDTO = (event: EventDetails): EventDetailsDTO => ({
  eventId: event.event_id,
  eventName: event.event_name,
  description: event.description,
  location: event.location,
  isPrivate: event.is_private,
  eventDate: event.event_date,
  createdAt: event.created_at,
  creatorId: event.creator_id,
  creatorName: event.creator_name,
  categoryId: event.category_id,
  categoryName: event.category_name,
  tags: event.tags,
  members: event.members.map(toMemberDTO),
});

export const toEventRowDTO = (row: EventRow): EventRowDTO => ({
  eventId: row.event_id,
  eventName: row.event_name,
  description: row.description,
  location: row.location,
  isPrivate: row.is_private,
  eventDate: row.event_date,
  createdAt: row.created_at,
  creatorId: row.creator_id,
  creatorName: row.creator_name,
  categoryId: row.category_id,
  categoryName: row.category_name,
  tags: row.tags,
});
