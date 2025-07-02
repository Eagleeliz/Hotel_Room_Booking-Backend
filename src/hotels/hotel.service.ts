import db from "../drizzle/db";
import { desc, eq } from "drizzle-orm";
import { THotelInsert, THotelSelect, hotelTable } from "../drizzle/schema";

//get all hotels
export const getHotelsServices = async (): Promise<THotelSelect[] | null> => {
  return await db.query.hotelTable.findMany({
    with:{
     rooms:true
    },
    orderBy: [desc(hotelTable.hotelId)],
  });
};

// Get hotel by ID
export const getHotelByIdServices = async ( hotelId: number): Promise<THotelSelect | undefined> => {
  return await db.query.hotelTable.findFirst({
     with:{
     rooms:true
    },
    where: eq(hotelTable.hotelId, hotelId),
  });
};

// Create a new hotel
export const createHotelServices = async (hotel: THotelInsert): Promise<string | null> => {
  const existingHotel = await db.query.hotelTable.findFirst({
    where: eq(hotelTable.name, hotel.name),
  });

  if (existingHotel) {
    return null; // Hotel already exists
  }

  await db.insert(hotelTable).values(hotel).returning();
  return "Hotel Created Successfully 🏨";
};

// Update an existing hotel
export const updateHotelServices = async (hotelId: number,hotel: Partial<THotelInsert>): Promise<string> => {
  await db.update(hotelTable).set(hotel).where(eq(hotelTable.hotelId, hotelId));
  return "Hotel Updated Successfully 🏨";
};

// Delete a hotel
export const deleteHotelServices = async (
  hotelId: number
): Promise<string | null> => {
  const deleted = await db
    .delete(hotelTable)
    .where(eq(hotelTable.hotelId, hotelId))
    .returning();

  if (deleted.length === 0) {
    return null; // Nothing was deleted
  }

  return "Hotel Deleted Successfully 🏨";
};