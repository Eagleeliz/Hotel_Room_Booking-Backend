
import db from "../drizzle/db";
import { desc, eq } from "drizzle-orm";
import { TRoomInsert, TRoomSelect, roomTable } from "../drizzle/schema";

// Get all rooms
export const getRoomsServices = async (): Promise<TRoomSelect[] | null> => {
  return await db.query.roomTable.findMany({
    with:{
      hotel:true
    },
       orderBy: [desc(roomTable.roomId)],
  });
};
  // orderBy: [desc(roomTable.roomId)],

// Get room by ID
export const getRoomByIdServices = async ( roomId: number): Promise<TRoomSelect | undefined> => {
  return await db.query.roomTable.findFirst({
    where: eq(roomTable.roomId, roomId),
      with:{
      hotel:true
    },
  });
};
//getRoomForaHotel
export const getRoomsByHotelIdService = async (hotelId: number): Promise<TRoomSelect[]> => {
  return await db.query.roomTable.findMany({
    where: eq(roomTable.hotelId, hotelId),
      with:{
      hotel:true
    },
    orderBy: [desc(roomTable.roomId)]
  });
};

//get available rooms
export const getAvailableRoomsService = async (): Promise<TRoomSelect[] | null> => {
  return await db.query.roomTable.findMany({
    where: eq(roomTable.isAvailable, true),
    with: {
      hotel: {
        columns: {
          name: true,
          location: true,
          address: true,
          category: true,
          rating: true
        }
      }
    }
  });
};

// Create a room
export const createRoomServices = async (
  room: TRoomInsert
): Promise<string> => {
  await db.insert(roomTable).values(room).returning();
  return "Room Created Successfully 🛏️";
};


// Update a room
export const updateRoomServices = async (
  roomId: number,
  room: Partial<TRoomInsert>
): Promise<string> => {
  await db.update(roomTable).set(room).where(eq(roomTable.roomId, roomId));
  return "Room Updated Successfully 🛏️";
};

// Delete a room
export const deleteRoomServices = async (
  roomId: number
): Promise<string | null> => {
  const deleted = await db
    .delete(roomTable)
    .where(eq(roomTable.roomId, roomId))
    .returning();

  if (deleted.length === 0) return null;
  return "Room Deleted Successfully 🛏️";
};
