// src/routes/roomRoutes.ts
import { Router } from "express";
import {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomsByHotelId,
  getAvailableRooms
} from "../Rooms/room.controller";

const roomRouter = Router();

// Room Routes
roomRouter.get("/rooms/available", getAvailableRooms); //get available room
roomRouter.get("/rooms", getRooms);              // GET all rooms
roomRouter.get("/rooms/:id", getRoomById);       // GET room by ID
roomRouter.post("/rooms", createRoom);           // POST new room
roomRouter.put("/rooms/:id", updateRoom);        // PUT update room by ID
roomRouter.delete("/rooms/:id", deleteRoom);     // DELETE room by ID
roomRouter.get("/hotels/:hotelId/rooms", getRoomsByHotelId); // Route to get rooms inside a hotel

export default roomRouter;
