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

export interface EventDetails {
  event_id: number;
  event_name: string;
  description: string;
  location: string;
  is_private: boolean;
  event_date: Date;
  created_at: Date;
  creator_name: string;
  category_id: number | null; //shouldn't be null since we are getting category_id from category table after joining with events table
  category_name: string | null;
  tag_names: string[];
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
