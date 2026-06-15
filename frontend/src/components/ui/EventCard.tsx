import type { EventRow } from "../../types/event.types";

interface EventCardProps {
  event: EventRow;
  onClick?: () => void;
}

const EventCard = ({ event, onClick }: EventCardProps) => {
  return (
    <div
      onClick={onClick}
      className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 hover:border-emerald-700 transition cursor-pointer flex flex-col gap-4"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-100 leading-snug">{event.event_name}</h2>

        <span className="shrink-0 text-xs uppercase tracking-wide border border-emerald-700 px-2 py-0.5 rounded-full text-slate-50">
          {event.is_private ? "Private" : "Public"}
        </span>
      </div>

      {event.description && (
        <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">{event.description}</p>
      )}

      {event.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {event.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="bg-slate-800/70 text-slate-300 px-2 py-0.5 rounded-md text-xs border border-slate-700"
            >
              {tag}
            </span>
          ))}

          {event.tags.length > 3 && (
            <span className="text-xs text-slate-500">+{event.tags.length - 3} more</span>
          )}
        </div>
      )}

      <div className="mt-auto pt-4 border-t border-slate-800 grid grid-cols-2 gap-2">
        <div>
          <p className="text-xs text-emerald-500 mb-0.5">Date</p>
          <p className="text-sm text-slate-300">{new Date(event.event_date).toDateString()}</p>
        </div>

        <div>
          <p className="text-xs text-emerald-500 mb-0.5">Location</p>
          <p className="text-sm text-slate-300 truncate">{event.location}</p>
        </div>

        <div className="col-span-2">
          <p className="text-xs text-emerald-500 mb-0.5">Organizer</p>
          <p className="text-sm text-slate-300">{event.creator_name}</p>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
