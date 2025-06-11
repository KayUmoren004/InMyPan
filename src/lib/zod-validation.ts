import * as z from "zod";

// Login
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),

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

// Forgot Password
export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

// Sign Up Email
export const signUpEmailSchema = z.object({
  email: z.string().email(),
  givenName: z.string().min(3, "First name must be at least 3 characters"),
  familyName: z.string().min(3, "Last name must be at least 3 characters"),
});

export type SignUpEmailSchema = z.infer<typeof signUpEmailSchema>;

// Sign Up Password
export const signUpPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

export type SignUpPasswordSchema = z.infer<typeof signUpPasswordSchema>;
