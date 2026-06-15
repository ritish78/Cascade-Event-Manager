import { useEffect, useState } from "react";
import axios from "axios";
import api from "../../api/axios";
import type { PaginatedEvents } from "../../types/event.types";
import EventCard from "../../components/ui/EventCard";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DEFAULT_PAGE_NUMBER, NUMBER_OF_EVENTS_PER_PAGE } from "../../config";

const EventsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [data, setData] = useState<PaginatedEvents | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //   const [page, setPage] = useState(1);
  //   const limit = 9; //the page is displaying in a 3x3 card format.

  const page = Math.max(1, Number(searchParams.get("page")) || DEFAULT_PAGE_NUMBER);
  const limit = Math.max(1, Number(searchParams.get("limit")) || NUMBER_OF_EVENTS_PER_PAGE);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.get("/events", { params: { page, limit } });
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
  }, [page, limit]);

  const setPage = (newPage: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", String(newPage));

      return next;
    });
  };

  const setLimit = (newLimit: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("limit", String(newLimit));

      return next;
    });
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading events!</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={() => setPage(1)} className="text-emerald-400 hover:underline cursor-pointer">
            Try again
          </button>
        </div>
      </div>
    );
  }

  const events = data?.events ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {events.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500 text-lg">No upcoming events found.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard
                key={event.event_id}
                event={event}
                onClick={() => navigate(`/events/${event.event_id}`)}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-12">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl border border-slate-700 text-sm text-slate-300 hover:border-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
            >
              Previous
            </button>

            <span className="text-sm text-slate-400">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl border border-slate-700 text-sm text-slate-300 hover:border-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
            >
              Next
            </button>

            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
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

export default EventsPage;
