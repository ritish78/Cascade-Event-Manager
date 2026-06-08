import db from "src/db";
import { User } from "src/types/user.types";

/**
 * @param email         string - email to use to search the user
 * @returns             User | null
 */
export const findUserByEmail = async (email: string) => {
  const userFromDatabase = await db<User>("users").where({ email }).first();

  return userFromDatabase ?? null;
};

/**
 * @param id            number - id to use to search the user
 * @returns             User | null
 */
export const findUserById = async (id: number) => {
  const userFromDatabase = await db<User>("users").where({ id }).first();

  return userFromDatabase ?? null;
};
