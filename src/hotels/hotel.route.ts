import { Router } from "express";
import {
  getHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel
} from "../hotels/hotel.controller";

export const hotelRouter = Router();

hotelRouter.get("/hotels", getHotels);             // GET all hotels
hotelRouter.get("/hotels/:id", getHotelById);       // GET single hotel by ID
hotelRouter.post("/hotels", createHotel);          // POST new hotel
hotelRouter.put("/hotels/:id", updateHotel);        // PUT update hotel by ID
hotelRouter.delete("/hotels/:id", deleteHotel);     // DELETE hotel by ID


