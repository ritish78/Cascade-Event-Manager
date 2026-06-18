import { Request, Response, NextFunction } from "express";
import { AuthError } from "../utils/error";
import { verifyAccessToken } from "../utils/jwt";

/**
 * @param req
 * @param res
 * @param next
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = req.cookies?.accessToken;

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

/**
 * @param req
 * @param res
 * @param next
 */
export const optionalAuthenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = req.cookies?.accessToken;

    if (accessToken) {
      const payload = verifyAccessToken(accessToken);
      req.user = payload.user;
    }

    //We are only setting the user id to the request body.
    next();
  } catch (error) {
    next(error);
  }
};
