// src/validators/roomValidator.ts
import { z } from "zod";

export const createRoomValidator = z.object({
  hotelId: z.number().int().positive(), 
  roomType: z.string().min(4).max(100).trim(),
  pricePerNight: z.number().positive(), 
  capacity: z.number().int().positive(), 
  amenities: z.string().min(2).trim(), 
  isAvailable: z.boolean().optional() , 
  roomImg:z.string().url().optional()
});

export const updateRoomValidator = createRoomValidator.extend({
  roomId: z.number().int().positive()
});
