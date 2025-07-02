import { Request, Response } from "express";
import {
  createHotelServices,
  deleteHotelServices,
  getHotelByIdServices,
  getHotelsServices,
  updateHotelServices
} from "../hotels/hotel.service";
import { createHotelValidator ,updateHotelValidator} from "../validation/hotel.validator";

// GET all hotels
export const getHotels = async (req: Request, res: Response) => {
  try {
    const hotels = await getHotelsServices();
    if (hotels == null || hotels.length === 0) {
      res.status(404).json({ message: "No hotels found" });
    } else {
      res.status(200).json(hotels);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch hotels" });
  }
};

// GET hotel by ID
export const getHotelById = async (req: Request, res: Response) => {
  const hotelId = parseInt(req.params.id);
  if (isNaN(hotelId)) {
    res.status(400).json({ error: "Invalid hotel ID" });
    return;
  }

  try {
    const hotel = await getHotelByIdServices(hotelId);
    if (hotel == undefined) {
      res.status(404).json({ message: "Hotel not found" });
    } else {
      res.status(200).json(hotel);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch hotel" });
  }
};

// POST create hotel
export const createHotel = async (req: Request, res: Response) => {
  const validatedData = createHotelValidator.parse(req.body);
  const { name, location, address, contactPhone, category, rating } = validatedData;

  if (!name || !location || !address || !contactPhone || !category || rating === undefined) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  try {
    const result = await createHotelServices({
      name,
      location,
      address,
      contactPhone,
      category,
      rating
    });

    if (result === null) {
      res.status(409).json({ message: "Hotel with this name already exists." });
      return;
    } else {
      res.status(201).json({ message: result });
      return;
    }
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Failed to create hotel due to internal error."
    });
  }
};

// PUT update hotel
export const updateHotel = async (req: Request, res: Response) => {
  const hotelId = parseInt(req.params.id);
  if (isNaN(hotelId)) {
    res.status(400).json({ error: "Invalid hotel ID" });
    return;
  }

  const { name, location, address, contactPhone, category, rating } = req.body;

  if (!name || !location || !address || !contactPhone || !category || rating === undefined) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  try {
    //vlalidate data
     const validatedData = updateHotelValidator.parse({ ...req.body, hotelId });

    const { name, location, address, contactPhone, category, rating } = validatedData;
    const result = await updateHotelServices(hotelId, {
      name,
      location,
      address,
      contactPhone,
      category,
      rating
    });

    res.status(200).json({ message: result });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Failed to update hotel"
    });
  }
};

// DELETE hotel
export const deleteHotel = async (req: Request, res: Response) => {
  const hotelId = parseInt(req.params.id);

  if (isNaN(hotelId)) {
    res.status(400).json({ error: "Invalid hotel ID" });
    return;
  }

  try {
    const result = await deleteHotelServices(hotelId);

    if (result) {
      res.status(200).json({ message: result });
    } else {
      res.status(404).json({ message: "Hotel not found" });
    }
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Failed to delete hotel"
    });
  }
};