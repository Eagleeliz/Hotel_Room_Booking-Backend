import { z } from "zod";

export const createUserValidator = z.object({
  firstName: z.string().min(4).max(100).trim(),
  lastName: z.string().min(1).max(100).trim(),
  email: z.string().email().trim(),
  password: z.string().min(4).max(100).trim(),
  role: z.enum(["admin", "user"]).optional(),
  contactPhone: z.string().min(5).max(100).trim(),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\s,.'-]{5,}$/, {
      message: "Address must contain both letters and numbers",
    })
    .trim(),
});


export const  updateUserValidator = createUserValidator.extend({
    id: z.number().int().positive()
})

export const userLogInValidator = z.object({
    email: z.string().email().trim(),
    password: z.string().min(4).max(100).trim(),
})
