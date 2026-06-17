import { useEffect, useState } from "react";
import axios from "axios";
import api from "../../api/axios";
import type { PaginatedEvents } from "../../types/event.types";
import EventCard from "../../components/ui/EventCard";
import { useNavigate } from "react-router-dom";
import EventsPagination from "../../components/ui/EventPaginationGroup";
import EventFilterGroup from "../../components/ui/EventFilterGroup";
import { useEventFilters } from "../../hooks/useEventFilters";

const EventsPage = () => {
  const navigate = useNavigate();
  const { page, limit, timeframe, categoryId, from, to, tagIds, updateFilterParam, toggleTag } =
    useEventFilters();

  const [data, setData] = useState<PaginatedEvents | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params: Record<string, string | number> = { page, limit };

        if (timeframe !== "upcoming") params.timeframe = timeframe;
        if (categoryId) params.categoryId = categoryId;
        if (from) params.from = from;
        if (to) params.to = to;
        if (tagIds.length > 0) params.tagIds = tagIds.join(",");

        const res = await api.get("/events", { params });
        setData(res.data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message ?? "Failed to load events!");
        } else {
          setError("Could not communicate with the backend. Please try again!");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [page, limit, timeframe, categoryId, from, to, tagIds.join(",")]);

  const events = data?.events ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <EventFilterGroup
          timeframe={timeframe}
          categoryId={categoryId}
          from={from}
          to={to}
          tagIds={tagIds}
          updateFilterParam={updateFilterParam}
          toggleTag={toggleTag}
        />

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <p className="text-slate-400">Loading events!</p>
          </div>
        )}

        {!isLoading && error && (
          <div className="flex items-center justify-center px-4 py-20">
            <div className="text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={() => updateFilterParam("page", "1")}
                className="text-emerald-400 hover:underline cursor-pointer"
              >
                Try again
              </button>
            </div>
          </div>
        )}
        {!isLoading && !error && events.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-500 text-lg">No events found</p>
            <button
              onClick={() => navigate("/events/create")}
              className="mt-4 text-emerald-400 hover:underline cursor-pointer"
            >
              Create your first event
            </button>
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

        {!isLoading && (
          <EventsPagination
            page={page}
            totalPages={totalPages}
            limit={limit}
            updateFilterParam={updateFilterParam}
          />
        )}
      </div>
    </div>
  );
};

export default EventsPage;
