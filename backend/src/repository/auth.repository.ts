import db from "src/db";
import { RefreshToken } from "src/types/refreshToken.types";
import { User } from "src/types/user.types";
import hashPassword from "src/utils/hashPassword";

/**
 * @param email         string - email to use to search the user
 * @returns             User | null
 */
export const findUserByEmail = async (email: string): Promise<User | null> => {
  const userFromDatabase = await db<User>("users").where({ email }).first();

  return userFromDatabase ?? null;
};

/**
 * @param id            number - id to use to search the user
 * @returns             User | null
 */
export const findUserById = async (id: number): Promise<User | null> => {
  const userFromDatabase = await db<User>("users").where({ id }).first();

  return userFromDatabase ?? null;
};

/**
 * @param id                number - id of the user to save the refresh_token
 * @param refreshToken      string - refresh token to store
 * @returns                 Promise - void
 */
export const insertRefreshToken = async (id: number, refreshToken: string): Promise<void> => {
  //We are using the hashPassword function to use argon2 to hash
  //the refresh token to insert in the database. Only the hash of
  //the token is stored. TODO: chage the hashPassword function name
  //to something different so it does not look out of place over here.
  const hashedToken = await hashPassword(refreshToken);
  await db("refresh_tokens").insert({
    user_id: id,
    token_hash: hashedToken,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
};

/**
 * @param id            number - id of the user to refresh the tokens
 * @returns             Promise - of tokens
 */
export const getActiveRefreshTokens = async (id: number): Promise<RefreshToken[]> => {
  const tokens = await db("refresh_tokens")
    .where({ user_id: id, revoked: false })
    .where("expires_at", ">", new Date());

  return tokens;
};

/**
 * @param tokenId       number - id of the token to be revoked
 */
export const revokeTokenById = async (tokenId: number): Promise<void> => {
  await db("refresh_tokens").where({ id: tokenId }).update({ revoked: true });
};
