import { useEffect, useState } from "react";
import type { EventFormData, EventFormProps } from "../types/event.types";
import type { Category } from "../types/categories.types";
import type { Tag } from "../types/tag.types";
import api from "../api/axios";
import axios from "axios";
import Button from "./ui/Button/Button";
import ToggleButton from "./ui/Button/ToggleButton";

export const EventForm = ({ initialValues, submitLabel, onSubmit }: EventFormProps) => {
  const [formData, setFormData] = useState<EventFormData>(initialValues);

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

  const selectedCategory = categories.find((category) => category.id === formData.categoryId);

  const toggleTag = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(id) ? prev.tagIds.filter((tagId) => tagId !== id) : [...prev.tagIds, id],
    }));
  };

  const handleSubmitEventForm = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.eventDate) {
      alert("Missing Event Date!");
      return;
    }

    if (formData.tagIds.length === 0) {
      alert("Please select atleast one tag!");
      return;
    }

    if (!formData.categoryId) {
      alert("Please choose the event category!");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await onSubmit(formData);
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
        <h1 className="font-bold mb-6">{submitLabel}</h1>
        {error && (
          <div className="mb-4 rounded-md border border-red-400 px-3 py-2 text-sm text-red-400">{error}</div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmitEventForm}>
          <div className="flex flex-col gap-1">
            <label className="font-medium">Event Name:</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              className="border rounded px-1"
              placeholder="22nd Hackathon on the New Year's Day"
              minLength={5}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium">Description:</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
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
              value={formData.location}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  location: e.target.value,
                }))
              }
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
              checked={formData.isPrivate}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  isPrivate: e.target.checked,
                }))
              }
              className="border rounded px-1"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium">Category</label>

            <select
              value={formData.categoryId ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  categoryId: Number(e.target.value),
                }))
              }
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
                <ToggleButton
                  shape="pill"
                  key={tag.id}
                  active={formData.tagIds.includes(tag.id)}
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.name}
                </ToggleButton>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium">Event Date</label>
            <input
              type="datetime-local"
              value={formData.eventDate}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  eventDate: e.target.value,
                }))
              }
              className="w-full rounded-xl border border-slate-700 bg-transparent px-4 py-2"
            />
          </div>
          <Button variant="primary" disabled={isLoading}>
            {isLoading ? "Submitting!" : submitLabel}
          </Button>
        </form>
      </div>
    </div>
  );
};
