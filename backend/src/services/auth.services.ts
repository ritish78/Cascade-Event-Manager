import {
  findUserByEmail,
  findUserById,
  getActiveRefreshTokens,
  insertRefreshToken,
  revokeTokenById,
} from "src/repository/auth.repository";
import { AuthError, BadRequestError, ForbiddenError, NotFoundError } from "src/utils/error";
import { passwordMatches } from "src/utils/hashPassword";
import { generateAccessToken, generateJWT, verifyRefreshToken } from "src/utils/jwt";
import argon2 from "argon2";
import { RefreshToken } from "src/types/refreshToken.types";
import { PublicUser } from "src/types/user.types";

/**
 * @param email         string - email provided by the user
 * @param password      string - password in plain text provided by user
 * @returns             Promise - JWT and user credentials
 */
export const loginUser = async (email: string, password: string) => {
  const user = await findUserByEmail(email);

  if (!user) {
    //The error message should be vague and same for when the user has incorrect password
    //Might need to setup a constant for it later
    throw new AuthError("Invalid Credentials!");
  }

  if (!user.is_active) {
    throw new ForbiddenError("Please contact admin to login!");
  }

  if (!user.is_verified) {
    throw new ForbiddenError("Email is not verified! Please verify email to continue!");
  }

  const isPasswordSame = await passwordMatches(password, user.password);

  if (!isPasswordSame) {
    //Same error message as above.
    throw new AuthError("Invalid Credentials!");
  }

  const tokens = generateJWT(user.id, user.full_name);

  await insertRefreshToken(user.id, tokens.refreshToken);

  return {
    ...tokens,
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      isVerified: user.is_verified,
      isActive: user.is_active,
    },
  };
};

/**
 * @param refreshToken      string - refresh token of user
 * @returns                 Promise - accessToken - string
 */
export const refreshAccessToken = async (
  refreshToken: string,
): Promise<{ accessToken: string; user: PublicUser }> => {
  let payload: { user: { id: number; fullName: string } };

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new BadRequestError("Invalid or expired token!");
  }

  //We need to check if the refreshToken provided by the user exists
  //and hasn't expired or revoked
  const userTokens = await getActiveRefreshTokens(payload.user.id);

  //Letting typescript know its going to be of type RefreshToken or null and intializing it to be null
  let validToken: RefreshToken | null = null;
  //Setting up a for loop to check userTokens matches might seem that it will slow down the app
  //but in reality, the number of userTokens is low. usually its just one.
  for (const token of userTokens) {
    const tokenMatches = await argon2.verify(token.token_hash, refreshToken);

    if (tokenMatches) {
      validToken = token;
      break;
    }
  }

  if (!validToken) {
    throw new AuthError("Invalid or Expired token!");
  }

  //After confirming that token exists and token has not been revoked or expired
  //we then check if the user exists
  const userExistsInOurDatabase = await findUserById(payload.user.id);

  if (
    !userExistsInOurDatabase ||
    !userExistsInOurDatabase.is_verified ||
    !userExistsInOurDatabase.is_active
  ) {
    throw new NotFoundError("User not found!");
  }

  return {
    accessToken: generateAccessToken(payload.user.id, userExistsInOurDatabase.full_name),
    user: {
      id: userExistsInOurDatabase.id,
      full_name: userExistsInOurDatabase.full_name,
      email: userExistsInOurDatabase.email,
      is_verified: userExistsInOurDatabase.is_verified,
      is_active: userExistsInOurDatabase.is_active,
    },
  };
};

/**
 * @param refreshToken          string - refresh token of the user
 * @returns                     Promise of void
 */
export const revokeRefreshToken = async (refreshToken: string): Promise<void> => {
  let payload: { user: { id: number; fullName: string } };

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new BadRequestError("Invalid or expired token!");
  }

  //Once we know that the RefreshToken provided by user is a valid token, we then
  //need to see if the user hasn't logged out or the refresh token has not expired.
  const userTokens = await getActiveRefreshTokens(payload.user.id);

  //A user can have more than one refresh tokens. They can login in different browsers
  //or even different devices. So, we need to check which instance of their login
  //they want to log out of. Then, we can remove that refresh token.
  for (const token of userTokens) {
    const tokenMatches = await argon2.verify(token.token_hash, refreshToken);

    if (tokenMatches) {
      await revokeTokenById(token.id);
    }
  }
};
