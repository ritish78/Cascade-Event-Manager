import type { EventsPaginationProps } from "../../types/event.types";

const EventsPagination = ({ page, totalPages, limit, updateFilterParam }: EventsPaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3 mt-12">
      <button
        onClick={() => updateFilterParam("page", String(Math.max(1, page - 1)))}
        disabled={page === 1}
        className="px-4 py-2 rounded-xl border border-slate-700 text-sm text-slate-300 hover:border-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
      >
        Previous
      </button>

      <span className="text-sm text-slate-400">
        Page {page} of {totalPages}
      </span>

      <button
        onClick={() => updateFilterParam("page", String(Math.min(totalPages, page + 1)))}
        disabled={page === totalPages}
        className="px-4 py-2 rounded-xl border border-slate-700 text-sm text-slate-300 hover:border-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
      >
        Next
      </button>

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
