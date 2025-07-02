// src/controllers/roomController.ts
import { Request, Response } from "express";
import {
  getRoomsServices,
  getRoomByIdServices,
  createRoomServices,
  updateRoomServices,
  deleteRoomServices,
  getRoomsByHotelIdService,
  getAvailableRoomsService
} from "../Rooms/room.service";

// GET all rooms
export const getRooms = async (req: Request, res: Response) => {
  try {
    const rooms = await getRoomsServices();
    if (!rooms || rooms.length === 0) {
      res.status(404).json({ message: "No rooms found" });
    } else {
      res.status(200).json(rooms);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch rooms" });
  }
};

// GET rooms by id
export const getRoomById = async (req: Request, res: Response) => {
  const roomId = parseInt(req.params.id);

  if (isNaN(roomId)) {
    res.status(400).json({ error: "Invalid room ID" });
    return;
  }

  try {
    const room = await getRoomByIdServices(roomId);
    if (!room) {
      res.status(404).json({ message: "Room not found" });
    } else {
      res.status(200).json(room);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch room" });
  }
};

//Get rooms in a certain Hotel
export const getRoomsByHotelId = async (req: Request, res: Response) => {
     console.log("🚀 /hotels/:hotelId/rooms was hit");
  const hotelId = parseInt(req.params.hotelId);

  if (isNaN(hotelId)) {
    res.status(400).json({ error: "Invalid hotel ID" });
    return;
  }

  try {
    const rooms = await getRoomsByHotelIdService(hotelId);
    if (!rooms || rooms.length === 0) {
      res.status(404).json({ message: "No rooms found for this hotel" });
    } else {
      res.status(200).json(rooms);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch rooms" });
  }
};

//get available rooms
export const getAvailableRooms = async (req: Request, res: Response): Promise<void> => {
  try {
    const rooms = await getAvailableRoomsService();
    if (rooms && rooms.length > 0) {
      res.status(200).json(rooms);
    } else {
      res.status(404).json({ message: "No available rooms found" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};


// create a new room
export const createRoom = async (req: Request, res: Response) => {
  const { hotelId, roomType, pricePerNight, capacity, amenities, isAvailable } = req.body;

  if (!hotelId || !roomType || !pricePerNight || !capacity || !amenities) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  try {
    const result = await createRoomServices({
      hotelId,
      roomType,
      pricePerNight,
      capacity,
      amenities,
      isAvailable
    });

    res.status(201).json({ message: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create room" });
  }
};

// update room
export const updateRoom = async (req: Request, res: Response) => {
  const roomId = parseInt(req.params.id);

  if (isNaN(roomId)) {
    res.status(400).json({ error: "Invalid room ID" });
    return;
  }

  const { hotelId, roomType, pricePerNight, capacity, amenities, isAvailable } = req.body;

  if (!hotelId || !roomType || !pricePerNight || !capacity || !amenities) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  try {
    const message = await updateRoomServices(roomId, {
      hotelId,
      roomType,
      pricePerNight,
      capacity,
      amenities,
      isAvailable
    });

    res.status(200).json({ message });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update room" });
  }
};

// delete room
export const deleteRoom = async (req: Request, res: Response) => {
  const roomId = parseInt(req.params.id);

  if (isNaN(roomId)) {
    res.status(400).json({ error: "Invalid room ID" });
    return;
  }

  try {
    const result = await deleteRoomServices(roomId);

    if (result === null) {
      res.status(404).json({ message: "Room not found" });
    } else {
      res.status(200).json({ message: result });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete room" });
  }
};
