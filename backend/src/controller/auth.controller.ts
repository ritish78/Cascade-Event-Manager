import { NextFunction, Request, Response } from "express";
import { ACCESS_TOKEN_COOKIE_OPTIONS, REFRESH_TOKEN_COOKIE_OPTIONS } from "src/config";
import { loginSchema } from "src/schema/auth.schema";
import { loginUser, refreshAccessToken } from "src/services/auth.services";
import { AuthError, BadRequestError } from "src/utils/error";

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      throw new BadRequestError("Invalid Request Body!");
    }

    const { accessToken, refreshToken, user } = await loginUser(result.data.email, result.data.password);

    res.cookie("accessToken", accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
    res.cookie("refreshToken", refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

    res.status(200).send({ user });
  } catch (error) {
    next(error);
  }
};

export const refreshAccess = async (req: Request, res: Response, next: NextFunction) => {
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
