import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import type { EventFormData } from "../../types/event.types";
import { EventForm } from "../../components/EventForm";

export const CreateEventPage = () => {
  const navigate = useNavigate();

  const handleCreateEvent = async (data: EventFormData) => {
    const response = await api.post("/events", data);

    navigate(`/events/${response.data.event_id}`);
  };

  return (
    <EventForm
      submitLabel="Create Event"
      initialValues={{
        name: "",
        description: "",
        location: "",
        isPrivate: false,
        categoryId: 0,
        tagIds: [],
        eventDate: "",
      }}
      onSubmit={handleCreateEvent}
    />
  );
};
