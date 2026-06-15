import { getTags } from "src/repository/tag.repository";
import { Tag } from "src/types/tag.types";

/**
 * @returns             Promise<Tag[]>
 */
export const getAllTags = async (): Promise<Tag[]> => {
  return getTags();
};
