import type { EventsPaginationProps } from "../../types/event.types";
import PaginationButton from "./Button/PaginationButton";

const EventsPagination = ({ page, totalPages, limit, updateFilterParam }: EventsPaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3 mt-12">
      <PaginationButton
        onClick={() => updateFilterParam("page", String(Math.max(1, page - 1)))}
        disabled={page === 1}
      >
        Previous
      </PaginationButton>

      <span className="text-sm text-slate-400">
        Page {page} of {totalPages}
      </span>

      <PaginationButton onClick={() => updateFilterParam("page", String(Math.min(totalPages, page + 1)))}>
        Next
      </PaginationButton>

      <select
        value={limit}
        onChange={(e) => updateFilterParam("limit", e.target.value)}
        className="px-4 py-2 rounded-xl border border-slate-700 text-sm text-slate-300 hover:border-emerald-600 cursor-pointer transition"
      >
        <option value={9}>9 per page</option>
        <option value={18}>18 per page</option>
        <option value={27}>27 per page</option>
      </select>
    </div>
  );
};

export default EventsPagination;
