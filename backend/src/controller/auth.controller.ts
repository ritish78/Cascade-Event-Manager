import { NextFunction, Request, Response } from "express";
import { ACCESS_TOKEN_COOKIE_OPTIONS, REFRESH_TOKEN_COOKIE_OPTIONS } from "src/config";
import { LoginInput, loginSchema } from "src/schema/auth.schema";
import { loginUser, refreshAccessToken, revokeRefreshToken } from "src/services/auth.services";
import { AuthError, BadRequestError } from "src/utils/error";

/**
 * @param req       Request object from express route
 * @param res       Response object from express route
 * @param next      NextFunction of express for middleware handling
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userInput: LoginInput = loginSchema.parse(req.body);

    //First, lets see if the user is already logged in and has refreshToken
    //We don't need to check for accessToken as we will generate new one
    const existingRefreshToken = req.cookies?.refreshToken;

    if (existingRefreshToken) {
      const { accessToken, user } = await refreshAccessToken(existingRefreshToken);

      res.cookie("accessToken", accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);

      res.status(200).send({ message: "Already logged in!", user });
      return;
    }

    const { accessToken, refreshToken, user } = await loginUser(userInput.email, userInput.password);

    res.cookie("accessToken", accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
    res.cookie("refreshToken", refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

    res.status(200).send({ message: "Logged in!", user });
  } catch (error) {
    next(error);
  }
};

/**
 * @param req       Request object from express route
 * @param res       Response object from express route
 * @param next      NextFunction of express for middleware handling
 */
export const refreshAccess = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new AuthError("Refresh token was not provided!");
    }

    const { accessToken } = await refreshAccessToken(refreshToken);

    res.cookie("accessToken", accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);

    res.status(200).send({ message: "Access Token refreshed!" });
  } catch (error) {
    next(error);
  }
};

/**
 * @param req       Request object from express route
 * @param res       Response object from express route
 * @param next      NextFunction of express for middleware handling
 */
export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      //we need to remove it from our database as well so that we don't generate
      //new access token for user using already logged out refresh token
      await revokeRefreshToken(refreshToken);
    }

    res.clearCookie("accessToken", ACCESS_TOKEN_COOKIE_OPTIONS);
    res.clearCookie("refreshToken", REFRESH_TOKEN_COOKIE_OPTIONS);

    res.status(200).send({ message: "Logged out successfully!" });
  } catch (error) {
    next(error);
  }
};
