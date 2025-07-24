import { z } from "zod";

export const createHotelValidator = z.object({
  name: z.string().min(5).max(100).trim(),         
  location: z.string().min(1).max(100).trim(),    
  address: z.string().min(4).max(1000).trim(),     
  contactPhone: z.string().min(5).max(20).trim(),  
  category: z.string().min(1).max(50).trim(),      
 rating: z.number().int().min(1).max(5).optional(),
  hotelImg:z.string().url().optional()   
});
export const updateHotelValidator = createHotelValidator.extend({
  hotelId: z.number().int().positive(), 
});