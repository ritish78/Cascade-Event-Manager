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
  tagIds: z.array(z.number().positive()).optional(), //id of the tags
});

export const updateEventSchema = createEventSchema.partial();

export const eventFilterSchema = z.object({
  isPrivate: z
    .enum(["true", "false"]) //the url req.query will have boolean values as string
    .optional()
    .transform((input) => (input === undefined ? undefined : input === "true")),
  createdBy: z.coerce.number().positive().optional(), //id will always be positive,
  categoryId: z
    .union([z.literal("null"), z.coerce.number().positive()])
    .optional()
    .transform((input) => (input === "null" ? null : input)),
  timeframe: z.enum(["upcoming", "past", "all"]).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),

  tagIds: z
    .string()
    .optional()
    .transform((input) =>
      input
        ? input
            .split(",")
            .map(Number)
            .filter((n) => !isNaN(n))
        : undefined,
    ),
});

export const userInviteSchema = z
  .object({
    email: z.email("Valid email is required!"),
  })
  .strict();

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type EventFilterInput = z.infer<typeof eventFilterSchema>;
export type UserInviteInput = z.infer<typeof userInviteSchema>;
