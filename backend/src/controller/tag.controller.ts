import { Request, Response } from "express";
import { getAllTags } from "src/services/tag.services";

/**
 * @route               /api/v1/tags
 * @method              GET
 * @access              Public
 */
export const getAllTagsController = async (req: Request, res: Response) => {
  const tags = await getAllTags();

  res.status(200).send(tags);
};
