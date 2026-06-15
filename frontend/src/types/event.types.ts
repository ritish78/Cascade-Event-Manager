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
  tags: string[];
  members: Member[];
}

export interface EventRow extends EventDetails {
  events_count: string;
}

export interface PaginatedEvents {
  totalEvents: number;
  page: number;
  limit: number;
  totalPages: number;
  events: EventRow[];
}
