import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import axios from "axios";
import type { EventFormData } from "../../types/event.types";
import { EventForm } from "../../components/EventForm";

export const EditEventPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [initialValues, setInitialValues] = useState<EventFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //First, we need to get the event details to fill the input for user to edit
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        console.log("ID", id);
        console.log("ID", id);
        console.log("ID", id);
        const res = await api.get(`/events/${id}`);
        const event = res.data;

        setInitialValues({
          name: event.event_name,
          description: event.description,
          location: event.location,
          isPrivate: event.is_private,
          categoryId: event.category_id ?? 0,
          tagIds: event.tags.map((t: { id: number }) => t.id), //extracting ids from tag objects
          eventDate: new Date(event.event_date).toISOString().slice(0, 16), //formating for datetime local input
        });
      } catch (err) {
        console.error("EditEventPage fetch error:", err);
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 404) {
            setError("Event not found!");
          } else if (err.response?.status === 403) {
            setError("You are not authorized to edit this event!");
          } else {
            setError(err.response?.data?.message ?? "Failed to load event!");
          }
        } else {
          setError("Could not communicate with the backend. Please try again!");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleEditEvent = async (data: EventFormData) => {
    await api.patch(`/events/${id}`, data);
    navigate(`/events/${id}`);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading event!</div>;
  }

  if (error || !initialValues) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-400">{error ?? "Event not found!"}</p>
      </div>
    );
  }

  return <EventForm submitLabel="Edit Event" initialValues={initialValues} onSubmit={handleEditEvent} />;
};
