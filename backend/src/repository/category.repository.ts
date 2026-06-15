import db from "src/db";
import { Category } from "src/types/category.types";

/**
 * @returns     Caregory[] - we currently have only 4 categories.
 */
export const getCategories = async (): Promise<Category[]> => {
  return db<Category>("categories").select("id", "name", "description");
};
