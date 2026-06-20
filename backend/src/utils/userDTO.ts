import { User, UserDTO } from "../types/user.types";

export const toUserDTO = (user: User): UserDTO => ({
  id: user.id,
  fullName: user.full_name,
  email: user.email,
  isVerified: user.is_verified,
  isActive: user.is_active,
});
