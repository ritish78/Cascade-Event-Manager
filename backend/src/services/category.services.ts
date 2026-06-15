import { getCategories } from "src/repository/category.repository";
import { Category } from "src/types/category.types";

/**
 * @returns             Promise<Category[]>
 */
export const getAllCategories = async (): Promise<Category[]> => {
  return getCategories();
};
