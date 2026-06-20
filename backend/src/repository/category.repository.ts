import db from "../db";
import { Category } from "../types/category.types";

/**
 * @returns     Caregory[] - we currently have only 4 categories.
 */
export const getCategories = async (): Promise<Category[]> => {
  return db<Category>("categories").select("id", "name", "description");
};
