import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../../api/axios";
import type { PaginatedEvents, UserEventsPageProps } from "../../types/event.types";
import EventCard from "../../components/ui/EventCard";
import { useEventFilters } from "../../hooks/useEventFilters";
import EventFilterGroup from "../../components/ui/EventFilterGroup";
import EventsPagination from "../../components/ui/EventPaginationGroup";

export const UserEventsPage = ({ endpoint, title, showStatusFilter = false }: UserEventsPageProps) => {
  const navigate = useNavigate();
  const { page, limit, timeframe, status, categoryId, from, to, tagIds, updateFilterParam, toggleTag } =
    useEventFilters();

  const [data, setData] = useState<PaginatedEvents | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params: Record<string, string | number> = { page, limit, timeframe };

        if (showStatusFilter && status !== "all") {
          params.status = status;
        }
        if (categoryId) params.categoryId = categoryId;
        if (from) params.from = from;
        if (to) params.to = to;
        if (tagIds.length > 0) params.tagIds = tagIds.join(",");

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
  }, [page, limit, timeframe, status, categoryId, from, to, tagIds.join(","), endpoint]);

  //   //we were using 4 different function to update page, limit, timeframe and status.
  //   //this function can take the key as page, limit, timeframe or status.
  //   //we also need to update the EventsPage, but currently there is only two filters
  //   const updateFilterParam = (key: string, value: string) => {
  //     setSearchParams((prev) => {
  //       const next = new URLSearchParams(prev);
  //       next.set(key, value);
  //       //making it even better. when the user changes the timeframe or status,
  //       //we are resetting the page to be on page 1 instead of being at the current page
  //       //and requesting /page=3&status=invited on the backend while there's not even
  //       //a 2nd page for status=invited.
  //       if (key !== "page") next.set("page", "1");
  //       return next;
  //     });
  //   };

  const events = data?.events ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-100">{title}</h1>
        </div>

        <div className="flex flex-col gap-6 mb-6">
          <div className="flex flex-wrap gap-12">
            <div className="flex gap-2">
              <EventFilterGroup
                timeframe={timeframe}
                categoryId={categoryId}
                from={from}
                to={to}
                tagIds={tagIds}
                updateFilterParam={updateFilterParam}
                toggleTag={toggleTag}
              />
            </div>
          </div>
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
