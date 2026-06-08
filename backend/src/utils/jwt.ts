import jwt from "jsonwebtoken";
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from "../config";

/**
 * @param userId        number - id of the user who is logged in
 * @param fullName      string - full name of the user
 * @returns             string - signed jwt
 */
export const generateAccessToken = (userId: number, fullName: string) => {
  const payload = {
    user: {
      id: userId,
      fullName,
    },
  };
  return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: "30m" });
};

/**
 * @param userId        number - id of the user who is logged in
 * @param fullName      string - full name of the user
 * @returns             string - signed jwt
 */
export const generateRefreshToken = (userId: number, fullName: string) => {
  const payload = {
    user: {
      id: userId,
      fullName,
    },
  };

  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

/**
 * @param userId        number - id of the user who is logged in
 * @param fullName      string - full name of the user
 * @returns             accessToken: string, refreshToken: string - signed jwt
 */
export const generateJWT = (userId: number, fullName: string) => {
  const accessToken = generateAccessToken(userId, fullName);
  const refreshToken = generateRefreshToken(userId, fullName);

  return { accessToken, refreshToken };
};

/**
 * @param token         string - acess token to verify
 * @returns             user: { id: number, fullName: string }
 */
export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, JWT_ACCESS_SECRET) as { user: { id: number; fullName: string } };
};

/**
 * @param token         string - acess token to verify
 * @returns             user: { id: number, fullName: string }
 */
export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as { user: { id: number; fullName: string } };
};
