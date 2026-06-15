import db from "src/db";
import { Tag } from "src/types/tag.types";

/**
 * @returns     Tag[] - all tags in our database. Currently, we only have 12 rows.
 */
export const getTags = async (): Promise<Tag[]> => {
  return db<Tag>("tags").select("id", "name");
};
