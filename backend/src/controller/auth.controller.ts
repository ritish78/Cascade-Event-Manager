import { Request, Response } from "express";
import { ACCESS_TOKEN_COOKIE_OPTIONS, REFRESH_TOKEN_COOKIE_OPTIONS } from "src/config";
import { loginSchema } from "src/schema/auth.schema";
import { loginUser } from "src/services/auth.services";

export const login = async (req: Request, res: Response) => {
  try {
    const userDetails = loginSchema.parse(req.body);

    const { accessToken, refreshToken, user } = await loginUser(userDetails.email, userDetails.password);

    res.cookie("accessToken", accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
    res.cookie("refreshToken", refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

    res.status(200).send(user);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};
