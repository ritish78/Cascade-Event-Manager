import { getTags } from "../repository/tag.repository";
import { Tag } from "../types/tag.types";

/**
 * @returns             Promise<Tag[]>
 */
export const getAllTags = async (): Promise<Tag[]> => {
  return getTags();
};
