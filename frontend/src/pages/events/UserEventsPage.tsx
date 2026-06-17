import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import api from "../../api/axios";
import type { MemberStatus, PaginatedEvents, Timeframe, UserEventsPageProps } from "../../types/event.types";
import EventCard from "../../components/ui/EventCard";
import {
  DEFAULT_PAGE_NUMBER,
  NUMBER_OF_EVENTS_PER_PAGE,
  STATUS_OPTIONS,
  TIMEFRAME_OPTIONS,
} from "../../config";

export const UserEventsPage = ({ endpoint, title, showStatusFilter = false }: UserEventsPageProps) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<PaginatedEvents | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //Read from URL params
  const page = Math.max(1, Number(searchParams.get("page")) || DEFAULT_PAGE_NUMBER);
  const limit = Math.max(1, Number(searchParams.get("limit")) || NUMBER_OF_EVENTS_PER_PAGE);
  //setting default as upcoming for timeframe and status to be all
  const timeframe = (searchParams.get("timeframe") as Timeframe) || "upcoming";
  const status = (searchParams.get("status") as MemberStatus | "all") || "all";

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params: Record<string, string | number> = {
          page,
          limit,
          timeframe,
        };

        //we only need to send status param for /events/joined and when not all
        if (showStatusFilter && status !== "all") {
          params.status = status;
        }

        const res = await api.get(endpoint, { params });
        setData(res.data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message ?? "Failed to load events.");
        } else {
          setError("Could not communicate with the backend. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [page, limit, timeframe, status, endpoint]);

  //we were using 4 different function to update page, limit, timeframe and status.
  //this function can take the key as page, limit, timeframe or status.
  //we also need to update the EventsPage, but currently there is only two filters
  const updateFilterParam = (key: string, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set(key, value);
      //making it even better. when the user changes the timeframe or status,
      //we are resetting the page to be on page 1 instead of being at the current page
      //and requesting /page=3&status=invited on the backend while there's not even
      //a 2nd page for status=invited.
      if (key !== "page") next.set("page", "1");
      return next;
    });
  };

  const events = data?.events ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-100">{title}</h1>
        </div>

        <div className="flex flex-wrap gap-12 mb-8">
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

          {showStatusFilter && (
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateFilterParam("status", option.value)}
                  className={`px-4 py-1.5 rounded-xl text-sm border transition cursor-pointer ${
                    status === option.value
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-slate-700 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <p className="text-slate-400">Loading events!</p>
          </div>
        )}

        {!isLoading && !error && events.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-500 text-lg">No events found</p>
            {endpoint === "/events/mine" && (
              <button
                onClick={() => navigate("/events/create")}
                className="mt-4 text-emerald-400 hover:underline cursor-pointer"
              >
                Create your first event
              </button>
            )}
          </div>
        )}

        {!isLoading && !error && events.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard
                key={event.eventId}
                event={event}
                onClick={() => navigate(`/events/${event.eventId}`)}
              />
            ))}
          </div>
        )}
        {!isLoading && totalPages > 1 && (
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
              className=" px-4 py-2 rounded-xl border border-slate-700 text-sm  text-slate-300 hover:border-emerald-600 cursor-pointer transition"
            >
              <option value={9}>9 per page</option>
              <option value={18}>18 per page</option>
              <option value={27}>27 per page</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};
