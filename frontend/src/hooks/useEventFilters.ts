import { useSearchParams } from "react-router-dom";
import { DEFAULT_PAGE_NUMBER, NUMBER_OF_EVENTS_PER_PAGE } from "../config";
import type { MemberStatus, Timeframe } from "../types/event.types";

export const useEventFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Math.max(1, Number(searchParams.get("page")) || DEFAULT_PAGE_NUMBER);
  const limit = Math.max(1, Number(searchParams.get("limit")) || NUMBER_OF_EVENTS_PER_PAGE);
  const timeframe = (searchParams.get("timeframe") as Timeframe) || "upcoming";
  const status = (searchParams.get("status") as MemberStatus | "all") || "all";
  const categoryId = searchParams.get("categoryId") || "";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const tagIds = searchParams.get("tagIds")
    ? searchParams.get("tagIds")!.split(",").map(Number).filter(Boolean)
    : [];

  const updateFilterParam = (key: string, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === "" || value === "all") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      if (key !== "page") next.set("page", "1");
      return next;
    });
  };

  const toggleTag = (id: number) => {
    const updated = tagIds.includes(id) ? tagIds.filter((t) => t !== id) : [...tagIds, id];
    updateFilterParam("tagIds", updated.join(","));
  };

  return {
    page,
    limit,
    timeframe,
    status,
    categoryId,
    from,
    to,
    tagIds,
    updateFilterParam,
    toggleTag,
  };
};
