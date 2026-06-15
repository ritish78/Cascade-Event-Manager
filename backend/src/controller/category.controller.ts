import { Request, Response } from "express";
import { getAllCategories } from "src/services/category.services";

/**
 * @route               /api/v1/categories
 * @method              GET
 * @access              Public
 */
export const getAllCategoriesController = async (req: Request, res: Response) => {
  const categories = await getAllCategories();

  res.status(200).send(categories);
};
