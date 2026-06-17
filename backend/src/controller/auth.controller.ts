import { NextFunction, Request, Response } from "express";
import { ACCESS_TOKEN_COOKIE_OPTIONS, REFRESH_TOKEN_COOKIE_OPTIONS } from "src/config";
import { LoginInput, loginSchema, RegisterInput, registerSchema } from "src/schema/auth.schema";
import { loginUser, refreshAccessToken, registerUser, revokeRefreshToken } from "src/services/auth.services";
import { AuthError, BadRequestError } from "src/utils/error";

/**
 * @route           /api/v1/auth/login
 * @method          POST
 * @access          Public
 */
export const loginController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userInput: LoginInput = loginSchema.parse(req.body);

    //First, lets see if the user is already logged in and has refreshToken
    //We don't need to check for accessToken as we will generate new one
    const existingRefreshToken = req.cookies?.refreshToken;

    if (existingRefreshToken) {
      //implementing try catch block inside another as refreshAccessToken throws
      //AuthError if validToken is not provided. When the user is logging in, we
      //need to create new create new Refresh Token. So, catch block clears the
      //cookie and we use loginUser function again to set tokens in cookies
      try {
        const { accessToken, user } = await refreshAccessToken(existingRefreshToken);

        res.cookie("accessToken", accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);

        res.status(200).send({ message: "Already logged in!", user });
        return;
      } catch (error) {
        res.clearCookie("accessToken", ACCESS_TOKEN_COOKIE_OPTIONS);
        res.clearCookie("refreshToken", REFRESH_TOKEN_COOKIE_OPTIONS);
      }
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
 * @route           /api/v1/auth/refresh
 * @method          POST
 * @access          Autheticated
 */
export const refreshAccessController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new AuthError("Refresh token was not provided!");
    }

    const { accessToken, user } = await refreshAccessToken(refreshToken);

    res.cookie("accessToken", accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);

    res.status(200).send({ message: "Access Token refreshed!", user });
  } catch (error) {
    next(error);
  }
};

/**
 * @route           /api/v1/auth/logout
 * @method          POST
 * @access          Autheticated
 */
export const logoutController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

/**
 * @route           /api/v1/auth/register
 * @method          POST
 * @access          Public
 */
export const registerController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userInput: RegisterInput = registerSchema.parse(req.body);

    await registerUser(userInput.full_name, userInput.email, userInput.password, userInput.confirm_password);

    res.status(201).send({ message: "Registered successfully!" });
  } catch (error) {
    next(error);
  }
};
