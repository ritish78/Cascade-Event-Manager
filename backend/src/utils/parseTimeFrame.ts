//the parseTimeFrmae seems like it should not exists. I was querying
//upcoming=true/false, and wanted to reuse the same  filter functions
//to allow for all events (past and future) to show up as well.
//while still having the functionality where if nothing is provided
//i.e. undefined, then it would use the upcoming=true by default.
export const parseTimeFrame = (option: unknown): "upcoming" | "past" | "all" | undefined => {
  if (option === "upcoming") return "upcoming";
  if (option === "past") return "past";
  if (option === "all") return "all";

  return undefined;
};

export const parseMemberStatus = (option: unknown): "accepted" | "invited" | "declined" | undefined => {
  if (option === "accepted") return "accepted";
  if (option === "invited") return "invited";
  if (option === "declined") return "declined";

  return undefined;
};
