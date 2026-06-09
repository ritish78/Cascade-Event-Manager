import { Request, Response, NextFunction } from "express";
import { AuthError } from "src/utils/error";
import { verifyAccessToken } from "src/utils/jwt";

/**
 * @param req
 * @param res
 * @param next
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = req.cookies?.refreshToken;

    if (!accessToken) {
      throw new AuthError("Access token was not provided!");
    }

    const payload = verifyAccessToken(accessToken);

    req.user = payload.user;

    next();
  } catch (error) {
    next(error);
  }
};
