import { getCategories } from "../repository/category.repository";
import { Category } from "../types/category.types";

/**
 * @returns             Promise<Category[]>
 */
export const getAllCategories = async (): Promise<Category[]> => {
  return getCategories();
};
