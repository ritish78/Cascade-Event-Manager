import { useEffect, useState } from "react";
import type { Category } from "../../types/categories.types";
import { type Tag } from "../../types/tag.types";
import api from "../../api/axios";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const CreateEventPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [eventDate, setEventDate] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [tagIds, setTagIds] = useState<number[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  //For the data that we will fetch
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    const fetchTagsAndCategories = async () => {
      try {
        const [categoriesResponse, tagResponse] = await Promise.all([
          api.get("/categories"),
          api.get("/tags"),
        ]);

        setCategories(categoriesResponse.data);
        setTags(tagResponse.data);
      } catch (error) {
        console.error(error);
        //Might implement showing error occurred while fetching tags and categories to user.
      }
    };

    fetchTagsAndCategories();
  }, []);

  const selectedCategory = categories.find((category) => category.id === categoryId);

  const toggleTag = (id: number) => {
    setTagIds((prev) => (prev.includes(id) ? prev.filter((tagId) => tagId !== id) : [...prev, id]));
  };

  const handleCreateEventForm = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!eventDate) {
      alert("Missing Event Date!");
      return;
    }

    if (tagIds.length === 0) {
      alert("Please select atleast one tag!");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const event = await api.post("/events", {
        name,
        description,
        location,
        isPrivate,
        eventDate,
        categoryId,
        tagIds,
      });

      navigate(`/events/${event.data.event_id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message ?? "Something went wrong! Please try again!");
      } else {
        setError("Could not communicate with the backend! Please try again!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm border rounded-lg p-8 shadow-sm">
        <h1 className="font-bold mb-6">Create an event</h1>
        {error && (
          <div className="mb-4 rounded-md border border-red-400 px-3 py-2 text-sm text-red-400">{error}</div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleCreateEventForm}>
          <div className="flex flex-col gap-1">
            <label className="font-medium">Event Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border rounded px-1"
              placeholder="22nd Hackathon on the New Year's Day"
              minLength={5}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium">Description:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border rounded px-1"
              placeholder="Celebrate your New Year with going and competing at our 22nd Hackathon. You might even win it!"
              minLength={5}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium">Location:</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="border rounded px-1"
              placeholder="Chamber of Commerce and Industry, Teku"
              minLength={5}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium">Private Event:</label>
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="border rounded px-1"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium">Category</label>

            <select
              value={categoryId ?? ""}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="w-full rounded-xl borderS px-4 py-3 bg-slate-800 focus:border-emerald-600 focus:outline-none"
            >
              <option value="">Select a category</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          {selectedCategory && <p className="mt-2 text-sm text-slate-400">{selectedCategory.description}</p>}
          <div className="flex flex-col gap-1">
            <label className="font-medium">Tags</label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1 rounded-full text-sm border transition
                                ${
                                  tagIds.includes(tag.id)
                                    ? "border-emerald-600 bg-emerald-600 text-white"
                                    : "border-slate-700 text-slate-300"
                                }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium">Event Date</label>
            <input
              type="datetime-local"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-transparent px-4 py-2"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-emerald-600 text-white rounded py-2 px-4 hover:bg-emerald-800 hover:cursor-pointer"
          >
            {isLoading ? "Creating event!" : "Create Event!"}
          </button>
        </form>
      </div>
    </div>
  );
};
