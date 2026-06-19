import { Request, Response } from "express";
import { getAllCategories } from "../services/category.services";
import logger from "src/utils/logger";

/**
 * @openapi
 * /categories:
 *   get:
 *     summary: Get all categories
 *     description: Get the list of categories.
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of all categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CategoryDTO'
 *             example:
 *               - id: 1
 *                 name: "Technology"
 *                 description: "Hackathons, tech showcase, and conference"
 *               - id: 2
 *                 name: "Sports"
 *                 description: "Sports Tournaments, team showcase and more"
 *               - id: 3
 *                 name: "Science"
 *                 description: "Science Fairs, Conference, Seminars and meetups"
 */
export const getAllCategoriesController = async (req: Request, res: Response) => {
  logger.info("Fetching all categories");
  const categories = await getAllCategories();

  res.status(200).send(categories);
};
