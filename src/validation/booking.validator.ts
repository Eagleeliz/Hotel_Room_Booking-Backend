// src/validation/booking.validator.ts
import { z } from "zod";

export const createBookingValidator = z.object({
  userId: z.number().int().positive(),
  roomId: z.number().int().positive(),
  checkInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Check-in date must be in YYYY-MM-DD format"),
  checkOutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Check-out date must be in YYYY-MM-DD format"),
  numberOfGuests: z.number().int().min(1),
  bookingStatus: z.enum(["Pending", "Confirmed", "Cancelled"]).optional(),
  totalAmount: z.string().optional(), // This will be calculated by the service, so optional for input
  paymentId: z.number().int().positive().optional(),
});

export const updateBookingValidator = z.object({
  userId: z.number().int().positive().optional(),
  roomId: z.number().int().positive().optional(),
  checkInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Check-in date must be in YYYY-MM-DD format").optional(),
  checkOutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Check-out date must be in YYYY-MM-DD format").optional(),
  numberOfGuests: z.number().int().min(1).optional(),
  bookingStatus: z.enum(["Pending", "Confirmed", "Cancelled"]).optional(),
  totalAmount: z.string().optional(),
  paymentId: z.number().int().positive().optional(),
});

export const bookingStatusValidator = z.enum(["Pending", "Confirmed", "Cancelled"]);