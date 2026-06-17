import type { Tag } from "./tag.types";

export interface Member {
  userId: number;
  fullName: string;
  status: MemberStatus;
  role: "organizer" | "attendee";
}

export interface EventDetails {
  eventId: number;
  eventName: string;
  description: string;
  location: string;
  isPrivate: boolean;
  eventDate: string;
  createdAt: string;
  creatorId: number;
  creatorName: string;
  categoryId: number | null; //shouldn't be null since we are getting category_id from category table after joining with events table
  category_name: string | null;
  tags: Tag[];
  members: Member[];
}

export interface EventRow {
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
  category_name: string | null;
  tags: string[];
  members: Member[];
}

export interface PaginatedEvents {
  totalEvents: number;
  page: number;
  limit: number;
  totalPages: number;
  events: EventRow[];
}

export interface EventFormData {
  name: string;
  description: string;
  location: string;
  isPrivate: boolean;
  eventDate: string;
  categoryId: number;
  tagIds: number[];
}

export interface EventFormProps {
  initialValues: EventFormData;
  submitLabel: string;
  isLoading?: boolean;
  error?: string | null;
  onSubmit: (data: EventFormData) => Promise<void>;
}

export interface InviteModalProps {
  eventId: number;
  onClose: () => void;
}

export type Timeframe = "upcoming" | "past" | "all";
export type MemberStatus = "invited" | "accepted" | "declined";

export interface UserEventsPageProps {
  endpoint: "/events/mine" | "/events/joined";
  title: string;
  showStatusFilter?: boolean; //we need status filter only for /events/joined
}
