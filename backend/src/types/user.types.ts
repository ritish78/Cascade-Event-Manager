export interface User {
  id: number;
  full_name: string;
  email: string;
  password: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
