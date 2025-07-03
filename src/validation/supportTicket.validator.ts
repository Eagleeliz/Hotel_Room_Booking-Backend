import { z } from "zod";

// Create Ticket Validator
export const supportTicketValidator = z.object({
  userId: z.number().int().positive({ message: "User ID must be a positive integer" }),
  subject: z
    .string()
    .min(3, { message: "Subject must be at least 3 characters" })
    .trim(),
  description: z
    .string()
    .min(5, { message: "Description must be at least 5 characters long" })
    .trim()
});

// Update Ticket Validator
export const updateSupportTicketValidator = supportTicketValidator.partial().extend({
  ticketId: z.number().int().positive({ message: "Ticket ID must be a positive number" })
});
