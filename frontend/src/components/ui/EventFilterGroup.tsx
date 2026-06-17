import { useEffect, useState } from "react";
import type { EventFilterGroupProps } from "../../types/event.types";
import type { Category } from "../../types/categories.types";
import type { Tag } from "../../types/tag.types";
import api from "../../api/axios";
import { TIMEFRAME_OPTIONS } from "../../config";

const EventFilterGroup = ({
  timeframe,
  categoryId,
  from,
  to,
  tagIds,
  updateFilterParam,
  toggleTag,
  showTimeframe = true,
}: EventFilterGroupProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    const fetchFiltersData = async () => {
      try {
        const [categoriesResponse, tagResponse] = await Promise.all([
          api.get("/categories"),
          api.get("/tags"),
        ]);
        setCategories(categoriesResponse.data);
        setTags(tagResponse.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchFiltersData();
  }, []);

  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex flex-wrap gap-3 items-center">
        {showTimeframe && (
          <div className="flex gap-2">
            {TIMEFRAME_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => updateFilterParam("timeframe", option.value)}
                className={`px-4 py-1.5 rounded-xl text-sm border transition cursor-pointer ${
                  timeframe === option.value
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-slate-700 text-slate-300 hover:border-slate-500"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        <select
          value={categoryId}
          onChange={(e) => updateFilterParam("categoryId", e.target.value)}
          className="border border-slate-700 rounded-xl px-3 py-1.5 text-sm bg-transparent text-slate-300 cursor-pointer"
        >
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <label>From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => updateFilterParam("from", e.target.value)}
            className="border border-slate-700 rounded-xl px-3 py-1.5 bg-transparent text-slate-300 cursor-pointer"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <label>To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => updateFilterParam("to", e.target.value)}
            className="border border-slate-700 rounded-xl px-3 py-1.5 bg-transparent text-slate-300 cursor-pointer"
          />
        </div>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className={`px-3 py-1 rounded-full text-xs border transition cursor-pointer ${
                tagIds.includes(tag.id)
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-slate-700 text-slate-400 hover:border-slate-500"
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventFilterGroup;
