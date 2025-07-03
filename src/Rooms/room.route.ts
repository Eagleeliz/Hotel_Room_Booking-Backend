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
import { adminOnly, anyAuthenticatedUser } from "../middleware/bearAuth";

const roomRouter = Router();

// Room Routes
roomRouter.get("/rooms/available", getAvailableRooms); //get available room
roomRouter.get("/rooms", getRooms);              // GET all rooms
roomRouter.get("/rooms/:id",adminOnly, getRoomById);       // GET room by ID
roomRouter.post("/rooms",adminOnly, createRoom);           // POST new room
roomRouter.put("/rooms/:id",adminOnly, updateRoom);        // PUT update room by ID
roomRouter.delete("/rooms/:id", deleteRoom);     // DELETE room by ID
roomRouter.get("/hotels/:hotelId/rooms", adminOnly,getRoomsByHotelId); // Route to get rooms inside a hotel

export default roomRouter;
