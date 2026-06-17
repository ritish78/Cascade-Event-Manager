import { Tag } from "./tag.types";

export interface Event {
  id: number;
  name: string;
  description: string;
  location: string;
  is_private: boolean;
  created_by: number;
  category_id: number | null;
  event_date: Date;
  created_at: Date;
  updated_at: Date;
}

export interface EventDTO {
  id: number;
  name: string;
  description: string;
  location: string;
  isPrivate: boolean;
  createdBy: number;
  categoryId: number | null;
  eventDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Member {
  user_id: number;
  full_name: string;
  status: "invited" | "accepted" | "declined";
  role: "organizer" | "attendee";
}

export interface EventDetails {
  event_id: number;
  event_name: string;
  description: string;
  location: string;
  is_private: boolean;
  event_date: string;
  created_at: string;
  creator_id: number;
  creator_name: string;
  category_id: number | null; //shouldn't be null since we are getting category_id from category table after joining with events table
  category_name: string | null;
  tags: Tag[];
  members: Member[];
}

export interface MemberDTO {
  userId: number;
  fullName: string;
  status: "invited" | "accepted" | "declined";
  role: "organizer" | "attendee";
}

export interface EventDetailsDTO {
  eventId: number;
  eventName: string;
  description: string;
  location: string;
  isPrivate: boolean;
  eventDate: string;
  createdAt: string;
  creatorId: number;
  creatorName: string;
  categoryId: number | null;
  categoryName: string | null;
  tags: Tag[];
  members: MemberDTO[];
}

export interface EventRow {
  event_id: number;
  event_name: string;
  description: string;
  location: string;
  is_private: boolean;
  event_date: string;
  created_at: string;
  creator_id: number;
  creator_name: string;
  category_id: number | null;
  category_name: string | null;
  tags: string[];
  events_count: string;
}

export interface EventRowDTO {
  eventId: number;
  eventName: string;
  description: string;
  location: string;
  isPrivate: boolean;
  eventDate: string;
  createdAt: string;
  creatorId: number;
  creatorName: string;
  categoryId: number | null;
  categoryName: string | null;
  tags: string[];
}

export interface PaginatedEvents {
  totalEvents: number;
  page: number;
  limit: number;
  totalPages: number;
  events: EventRowDTO[];
}

//we have these event search filters
export interface EventFilters {
  tagIds?: number[];
  isPrivate?: boolean;
  createdBy?: number;
  categoryId?: number | null;
  timeframe?: "upcoming" | "past" | "all";
  from?: Date | string;
  to?: Date | string;
  sort?: string; //we have come full circle. /upcoming and /past.
}

export interface EventMember {
  id: number;
  event_id: number;
  user_id: number;
  invited_by: number;
  role: "organizer" | "attendee";
  status: "invited" | "accepted" | "declined";
  created_at: string;
  updated_at: string;
}
