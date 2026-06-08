import { Request, Response, NextFunction } from "express";
import { GenericError } from "src/utils/error";
import z, { ZodError } from "zod";

export const errorHandler = (error: unknown, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof GenericError) {
    return res.status(error.statusCode).send({ error: error.name, message: error.message });
  }

  //if the error is from Zod
  if (error instanceof ZodError) {
    //using z.treeifyError() to show what request body was invalid
    return res
      .status(400)
      .send({
        error: error.name,
        message: "Could not process the invalid body!",
        feilds: z.treeifyError(error),
      });
  }

  //For other errors
  return res
    .status(500)
    .send({
      error: "Server Error!",
      message:
        "Oops! Looks like our server is not able to process requests at the moment! Please visit back later!",
    });
};
