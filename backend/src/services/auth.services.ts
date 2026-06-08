import { findUserByEmail, findUserById } from "src/repository/auth.repository";
import { AuthError, BadRequestError, ForbiddenError, NotFoundError } from "src/utils/error";
import { passwordMatches } from "src/utils/hashPassword";
import { generateAccessToken, generateJWT, verifyRefreshToken } from "src/utils/jwt";

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
 * @returns                 Promise
 */
export const refreshAccessToken = async (refreshToken: string) => {
  let payload: { user: { id: number; fullName: string } };

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new BadRequestError("Invalid or expired token!");
  }

  const userExistsInOurDatabase = await findUserById(payload.user.id);

  if (
    !userExistsInOurDatabase ||
    !userExistsInOurDatabase.is_verified ||
    !userExistsInOurDatabase.is_active
  ) {
    throw new NotFoundError("User not found!");
  }

  return {
    accessToken: generateAccessToken(userExistsInOurDatabase.id, userExistsInOurDatabase.full_name),
  };
};
