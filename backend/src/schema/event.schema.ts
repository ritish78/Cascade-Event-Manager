import { z } from "zod";

export const createEventSchema = z.object({
  name: z
    .string()
    .trim()
    .min(5, { error: "Please enter the name of event to be of between 5 and 255 chacters!" })
    .max(255),
  description: z
    .string()
    .trim()
    .min(5, { error: "Please enter description length of more thatn 5 characters!" }),
  location: z.string().trim().min(1, { error: "Location is required!" }),
  isPrivate: z.boolean().optional(), //by default, we will set it as false.
  eventDate: z.coerce.date().min(new Date(), { error: "New events must be in the future!" }), //user won't be create event that has already expired
  categoryId: z.number().positive(),
  tags: z.array(z.number().positive()).optional(), //id of the tags
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
