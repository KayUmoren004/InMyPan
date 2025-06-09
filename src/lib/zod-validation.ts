import * as z from "zod";

// Login
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),

  //   password: z
  //     .string()
  //     .min(6, "Password must be at least 6 characters")
  //     .max(4096, "Password must not exceed 4096 characters")
  //     .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  //     .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  //     .regex(/[0-9]/, "Password must contain at least one number")
  //     .regex(
  //       /[^A-Za-z0-9]/,
  //       "Password must contain at least one special character"
  //     ),
});

export type LoginSchema = z.infer<typeof loginSchema>;
