import { NextFunction, Request, Response } from "express";
import { ACCESS_TOKEN_COOKIE_OPTIONS, REFRESH_TOKEN_COOKIE_OPTIONS } from "../config";
import { LoginInput, loginSchema, RegisterInput, registerSchema } from "../schema/auth.schema";
import { loginUser, refreshAccessToken, registerUser, revokeRefreshToken } from "../services/auth.services";
import { AuthError } from "../utils/error";
import logger from "src/utils/logger";

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login
 *     description: >
 *       Logs in user using their email and password.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *           example:
 *             email: "rajeshhamal@email.com"
 *             password: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         headers:
 *           Set-Cookie:
 *             description: Sets accessToken and refreshToken as httpOnly cookies
 *             schema:
 *               type: string
 *               example: "accessToken=eyJ...; HttpOnly; Secure; SameSite=Strict"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/UserDTO'
 *             examples:
 *               loggedIn:
 *                 summary: Fresh login
 *                 value:
 *                   message: "Logged in!"
 *                   user:
 *                     id: 1
 *                     fullName: "Rajesh Hamal"
 *                     email: "rajeshhamal@email.com"
 *                     isVerified: true
 *                     isActive: true
 *               alreadyLoggedIn:
 *                 summary: Already logged in — valid refresh token cookie found
 *                 value:
 *                   message: "Already logged in!"
 *                   user:
 *                     id: 1
 *                     fullName: "Rajesh Hamal"
 *                     email: "rajeshhamal@email.com"
 *                     isVerified: true
 *                     isActive: true
 *       400:
 *         description: Invalid request body
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ZodError'
 *             example:
 *               error: "ZodError"
 *               message: "Could not process the invalid body!"
 *               fields:
 *                 - field: "email"
 *                   message: "Invalid input: expected string, received undefined"
 *                   expected: "string"
 *                   received: "undefined"
 *                 - field: "password"
 *                   message: "Invalid input: expected string, received undefined"
 *                   expected: "string"
 *                   received: "undefined"
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "AuthError"
 *               message: "Invalid Credentials!"
 *       403:
 *         description: Account inactive or email not verified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               inactive:
 *                 summary: Account inactive
 *                 value:
 *                   error: "ForbiddenError"
 *                   message: "Please contact admin to login!"
 *               unverified:
 *                 summary: Email not verified
 *                 value:
 *                   error: "ForbiddenError"
 *                   message: "Email is not verified! Please verify email to continue!"
 */
export const loginController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.info("Login attempt", { body: req.body }, true);
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
        logger.info(
          "Existing refresh token found in cookies, attempting to refresh access token",
          { existingRefreshToken },
          true,
        );
        const { accessToken, user } = await refreshAccessToken(existingRefreshToken);

        res.cookie("accessToken", accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);

        res.status(200).send({ message: "Already logged in!", user });
        return;
      } catch (error) {
        logger.error(
          "Failed to refresh access token using existing refresh token during login attempt",
          { existingRefreshToken, error },
          true,
        );
        res.clearCookie("accessToken", ACCESS_TOKEN_COOKIE_OPTIONS);
        res.clearCookie("refreshToken", REFRESH_TOKEN_COOKIE_OPTIONS);
      }
    }

    logger.info("Attempting to login user", { email: userInput.email }, true);
    const { accessToken, refreshToken, user } = await loginUser(userInput.email, userInput.password);

    logger.info("Login successful, setting cookies", { user: { id: user.id, email: user.email } }, true);
    res.cookie("accessToken", accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
    res.cookie("refreshToken", refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

    res.status(200).send({ message: "Logged in!", user });
  } catch (error) {
    logger.error("Login attempt failed", { body: req.body, error }, true);
    next(error);
  }
};

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: >
 *       Refresh the access token saved in cookie using refresh token which is also stored in cookie. Refresh token is validated in our database before issuing a new access token.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *         headers:
 *           Set-Cookie:
 *             description: Sets a new accessToken as an httpOnly cookie
 *             schema:
 *               type: string
 *               example: "accessToken=eyJ...; HttpOnly; Secure; SameSite=Strict"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/UserDTO'
 *             example:
 *               message: "Access Token refreshed!"
 *               user:
 *                 id: 1
 *                 fullName: "Rajesh Hamal"
 *                 email: "rajeshhamal@email.com"
 *                 isVerified: true
 *                 isActive: true
 *       400:
 *         description: Refresh token is invalid or expired
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "BadRequestError"
 *               message: "Invalid or expired token!"
 *       401:
 *         description: Refresh token not provided or does not match any active session
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               notProvided:
 *                 summary: Refresh token cookie missing
 *                 value:
 *                   error: "AuthError"
 *                   message: "Refresh token was not provided!"
 *               invalidToken:
 *                 summary: Token not found in active sessions
 *                 value:
 *                   error: "AuthError"
 *                   message: "Invalid or Expired token!"
 *       404:
 *         description: User no longer exists or is inactive or unverified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "ResourceNotFound"
 *               message: "User not found!"
 */
export const refreshAccessController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    logger.info("Attempting to refresh access token", null, true);
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      logger.error("Refresh token not provided in cookies during access token refresh attempt", null, true);
      throw new AuthError("Refresh token was not provided!");
    }

    const { accessToken, user } = await refreshAccessToken(refreshToken);

    res.cookie("accessToken", accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);

    res.status(200).send({ message: "Access Token refreshed!", user });
  } catch (error) {
    logger.error("Failed to refresh access token", { error }, true);
    next(error);
  }
};

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Logout
 *     description: >
 *       Current Logged in user can logout. Their cookies are cleared and refresh token is revoked.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         headers:
 *           Set-Cookie:
 *             description: Clears accessToken and refreshToken cookies
 *             schema:
 *               type: string
 *               example: "accessToken=; Max-Age=0; HttpOnly; Secure; SameSite=Strict"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Logged out successfully!"
 *       500:
 *         description: Unexpected server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "ServerError"
 *               message: "Oops! Looks like our server is not able to process requests at the moment! Please visit back later!"
 */
export const logoutController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.info("Logout attempt", { user: req.user }, true);
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
    logger.error("Failed to logout user", { user: req.user, error }, true);
    next(error);
  }
};

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: >
 *       User can create an account using their email.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *           example:
 *             fullName: "Rajesh Hamal"
 *             email: "rajeshhamal@email.com"
 *             password: "password123"
 *             confirmPassword: "password123"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Registered successfully!"
 *       400:
 *         description: Invalid request body or passwords do not match
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ZodError'
 *             examples:
 *               validationError:
 *                 summary: Missing or invalid fields
 *                 value:
 *                   error: "ZodError"
 *                   message: "Could not process the invalid body!"
 *                   fields:
 *                     - field: "fullName"
 *                       message: "Invalid input: expected string, received undefined"
 *                       expected: "string"
 *                       received: "undefined"
 *                     - field: "email"
 *                       message: "Valid email is required!"
 *                       expected: "string"
 *                       received: "undefined"
 *               passwordMismatch:
 *                 summary: Passwords do not match
 *                 value:
 *                   error: "BadRequestError"
 *                   message: "Mismatch Password!"
 *       409:
 *         description: Email already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "ConflictError"
 *               message: "User is already registered! Login in instead!"
 */
export const registerController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info("Registration attempt", { body: req.body }, true);
    const userInput: RegisterInput = registerSchema.parse(req.body);

    await registerUser(userInput.fullName, userInput.email, userInput.password, userInput.confirmPassword);

    res.status(201).send({ message: "Registered successfully!" });
  } catch (error) {
    logger.error("Failed to register user", { body: req.body, error }, true);
    next(error);
  }
};
