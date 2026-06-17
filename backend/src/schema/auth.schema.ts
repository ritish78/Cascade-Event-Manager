import { z } from "zod";

export const loginSchema = z
  .object({
    email: z.email("Valid Email is required!"),
    password: z.string().min(8, { error: "Please enter password of length 8 or more!" }),
  })
  .strict();

export const registerSchema = z
  .object({
    full_name: z.string().min(1, { error: "Full Name is required!" }),
    email: z.email("Valid email is required!"),
    password: z.string().min(8, { error: "Please enter password of length 8 or more!" }),
    confirm_password: z.string().min(8, { error: "Please enter password of length 8 or more!" }),
  })
  .strict();

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
