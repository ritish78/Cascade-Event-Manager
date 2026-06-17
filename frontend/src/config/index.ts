import type { MemberStatus, Timeframe } from "../types/event.types";

export const NUMBER_OF_EVENTS_PER_PAGE = 9;
export const DEFAULT_PAGE_NUMBER = 1;
export const TIMEFRAME_OPTIONS: { label: string; value: Timeframe }[] = [
  { label: "Upcoming", value: "upcoming" },
  { label: "Past", value: "past" },
  { label: "All", value: "all" },
];

export const STATUS_OPTIONS: { label: string; value: MemberStatus | "all" }[] = [
  { label: "Accepted", value: "accepted" },
  { label: "Invited", value: "invited" },
  { label: "Declined", value: "declined" },
  { label: "All", value: "all" },
];
