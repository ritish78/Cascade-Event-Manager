import { useNavigate, useParams } from "react-router-dom";
import type { EventDetails } from "../../types/event.types";
import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import api from "../../api/axios";
import axios from "axios";
import { InviteModal } from "../../components/ui/InviteModal";

const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState<EventDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showInviteModal, setShowInviteModal] = useState(false);

  const [rsvpStatus, setRsvpStatus] = useState<"idle" | "loading" | "joined">("idle");

  useEffect(() => {
    const fetchEvent = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await api.get(`/events/${id}`);
        setEvent(res.data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message ?? "Failed to load event.");
        } else {
          setError("Could not communicate with the backend. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleRSVP = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setRsvpStatus("loading");

    try {
      await api.post(`/events/${id}/join`);
      window.location.reload();
    } catch {
      setRsvpStatus("idle");
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading the event!</div>;
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error ?? "Event not found."}</p>

          <a href="/" className="mt-4 no-underline hover:underline">
            Back to Events Page!
          </a>
        </div>
      </div>
    );
  }

  const userMembership = user ? event.members.find((m) => m.userId === user.id) : null;

  const handleRespond = async (response: "accepted" | "declined") => {
    try {
      await api.patch(`/events/${event.eventId}/respond`, { response });
      window.location.reload();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? "Failed to respond.");
      }
    }
  };

  const handleDelete = async () => {
    //shortcut way without creating another modal. will visit this later if i have time to create
    //the modal for confirmation to delete. currently, this seems to suffice
    if (!confirm("Are you sure that you want to delete this event?")) return;
    try {
      await api.delete(`/events/${id}`);
      navigate("/");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? "Failed to delete.");
      }
    }
  };

  const isOwner = user?.id === event.creatorId;
  const isJoined = event?.members?.some((m) => m.userId === user?.id && m.status === "accepted");

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10 border-b border-b-emerald-800 pb-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">{event.eventName}</h1>

              {event.category_name && (
                <p className="text-emerald-400 mt-2">Category: {event.category_name}</p>
              )}
            </div>

            <span className="text-xs uppercase tracking-wide border border-emerald-700 px-3 py-1 rounded-full text-slate-50">
              {event.isPrivate ? "Private" : "Public"}
            </span>
          </div>

          <div className="grid sm:grid-cols-3 gap-5 mt-8">
            <div>
              <p className="text-sm text-emerald-500 mb-1">Date</p>
              <p className="text-slate-200">{new Date(event.eventDate).toDateString()}</p>
            </div>

            <div>
              <p className="text-sm text-emerald-500 mb-1">Location</p>
              <p className="text-slate-200">{event.location}</p>
            </div>

            <div>
              <p className="text-sm text-emerald-500 mb-1">Organizer</p>
              <p className="text-slate-200">{event.creatorName}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[2fr_1fr] gap-12">
          <div>
            {event.description && (
              <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">About this event</h2>

                <p className="text-slate-300 leading-8 whitespace-pre-wrap">{event.description}</p>
              </section>
            )}

            {event.tags.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4">Tags</h2>

                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="bg-slate-800/70 text-slate-300 px-3 py-1.5 rounded-md text-sm border border-slate-700"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div>
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 sticky top-6">
              <h2 className="font-semibold text-lg mb-5">Participation</h2>

              {isOwner ? (
                <>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/events/${event.eventId}/edit`)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-slate-50 rounded-xl py-3 font-medium transition cursor-pointer"
                    >
                      Edit Event
                    </button>
                    <button
                      onClick={() => handleDelete()}
                      className="flex-1 border border-red-500 hover:bg-red-500/10 text-red-400 rounded-xl py-3 font-medium transition cursor-pointer"
                    >
                      Delete Event
                    </button>
                  </div>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 text-slate-50 rounded-xl py-3 font-medium transition cursor-pointer"
                  >
                    Invite Members
                  </button>
                </>
              ) : userMembership?.status === "invited" ? (
                //when the current user is invited, we show accept and decline button instead of Join Event button
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRespond("accepted")}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-slate-50 rounded-xl py-3 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRespond("declined")}
                    className="flex-1 border border-red-500 hover:bg-red-500/10 text-red-400 rounded-xl py-3 font-medium transition cursor-pointer"
                  >
                    Decline
                  </button>
                </div>
              ) : userMembership?.status === "accepted" ? (
                //when the user has already accepted, we are disabling the button
                <button
                  disabled
                  className="w-full border border-emerald-600 text-emerald-400 rounded-xl py-3 font-medium opacity-60 cursor-not-allowed"
                >
                  Joined
                </button>
              ) : userMembership?.status === "declined" ? (
                //this is when the user has declined, and wants to change their response to accept
                <button
                  onClick={handleRSVP}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-slate-50 rounded-xl py-3 font-medium transition cursor-pointer"
                >
                  Join Event
                </button>
              ) : (
                <button
                  onClick={handleRSVP}
                  disabled={rsvpStatus === "loading" || isJoined}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-slate-50 rounded-xl py-3 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {user?.id ? "Join Event" : "Login to join"}
                </button>
              )}
              {showInviteModal && (
                <InviteModal
                  eventId={event.eventId}
                  onClose={() => {
                    setShowInviteModal(false);
                    window.location.reload();
                  }}
                />
              )}

              <div className="mt-6 pt-6 border-t border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-slate-100">Members</h3>

                  <span className="text-sm text-slate-400">{event.members.length}</span>
                </div>

                {event.members.length > 0 ? (
                  <div className="space-y-3">
                    {event.members.map((mem) => (
                      <div
                        key={mem.userId}
                        className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-200">{mem.fullName}</p>

                          <p className="text-xs text-slate-500 capitalize">{mem.role}</p>
                        </div>

                        <span
                          className={`text-xs px-3 py-1 rounded-full capitalize
                                        ${
                                          mem.status === "accepted"
                                            ? "text-emerald-300 border border-emerald-300"
                                            : mem.status === "declined"
                                              ? "text-red-300 border border-red-300"
                                              : "text-yellow-300 border border-yellow-300"
                                        }
                                    `}
                        >
                          {mem.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No members yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
