import { Request, Response } from "express";
import { getAllTags } from "../services/tag.services";

/**
 * @openapi
 * /tags:
 *   get:
 *     summary: Get all tags
 *     description: Returns a list of all available event tags.
 *     tags: [Tags]
 *     responses:
 *       200:
 *         description: List of all tags
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tag'
 *             example:
 *               - id: 1
 *                 name: "Birthday"
 *               - id: 2
 *                 name: "Conference"
 *               - id: 3
 *                 name: "Workshop"
 */
export const getAllTagsController = async (req: Request, res: Response) => {
  const tags = await getAllTags();

  res.status(200).send(tags);
};
