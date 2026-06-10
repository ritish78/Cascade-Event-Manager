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
