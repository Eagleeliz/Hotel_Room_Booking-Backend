import { and, between, eq, gte, lte } from "drizzle-orm";
import db from "../drizzle/db";
import {
  bookingTable,
  roomTable,
  userTable,
  hotelTable,
  paymentTable,
  paymentStatus
} from "../drizzle/schema";
import type { TBookingInsert, TBookingSelect, TRoomSelect } from "../drizzle/schema";

export const getAllBookingsService = async (): Promise<TBookingSelect[] | null> => {
  return await db.query.bookingTable.findMany({
    with: {
      
      user: {
        columns: {
          userId: true,
          firstName: true,
          lastName: true,
          email: true,
          contactPhone: true
        }
      },
      room: {
        with: {
          hotel: {
            columns: {
              name: true,
              location: true,
              address: true
            }
          }
        }
      },
      payment: true
    },
    orderBy: (bookingTable, { desc }) => [desc(bookingTable.createdAt)]
  });
};

export const getBookingByIdService = async (id: number): Promise<TBookingSelect | undefined> => {
  return await db.query.bookingTable.findFirst({
    where: eq(bookingTable.bookingId, id),
    with: {
      user: true,
      room: {
        with: {
          hotel: true
        }
      },
      payment: true
    }
  });
};

export const getBookingWithCompleteDetailsService = async (id: number): Promise<TBookingSelect | undefined> => {
  return await db.query.bookingTable.findFirst({
    where: eq(bookingTable.bookingId, id),
    with: {
      user: true,
      room: {
        with: {
          hotel: true
        }
      },
      payment: true
    }
  });
};

export const getBookingsByRoomIdService = async (roomId: number): Promise<TBookingSelect[]> => {
  return await db.query.bookingTable.findMany({
    where: eq(bookingTable.roomId, roomId),
    with: {
      user: true,
      room: {
        with: {
          hotel: true
        }
      },
      payment: true
    },
    orderBy: (bookingTable, { desc }) => [desc(bookingTable.createdAt)]
  });
};

export const getBookingsByStatusService = async (status: "Pending" | "Confirmed" | "Cancelled") => {
  return await db.query.bookingTable.findMany({
    where: eq(bookingTable.bookingStatus, status),
    with: {
      user: true,
      room: {
        with: {
          hotel: true
        }
      },
      payment: true
    },
    orderBy: (bookingTable, { desc }) => [desc(bookingTable.createdAt)]
  });
};

export const getUserBookingHistoryService = async (userId: number): Promise<TBookingSelect[]> => {
  return await db.query.bookingTable.findMany({
    where: eq(bookingTable.userId, userId),
    with: {
      room: {
        with: {
          hotel: true
        }
      },
      payment: true
    },
    orderBy: (bookingTable, { desc }) => [desc(bookingTable.checkInDate)]
  });
};

export const getHotelBookingsStatsService = async (hotelId: number): Promise<TRoomSelect[] | null> => {
  return await db.query.roomTable.findMany({
    where: eq(roomTable.hotelId, hotelId),
    with: {
      
      bookings:{
        with:{
          user:{
            columns:{
              firstName:true,
              lastName:true,
              email:true
            }
          },
          payment:{
            columns:{
              amount:true,
              paymentStatus:true
            }
          }
        }

      }
    
    },
    orderBy: (bookingTable, { desc }) => [desc(bookingTable.createdAt)]
  });
};

export const createNewBookingService = async (data: any) => {
  const isAvailable = await checkRoomAvailabilityService(data.roomId, data.checkInDate, data.checkOutDate);
  if (!isAvailable) throw new Error("Room is not available for the selected dates");

  const room = await db.query.roomTable.findFirst({
    where: eq(roomTable.roomId, data.roomId!)
  });

  if (!room) throw new Error("Room not found");

  const nights = Math.ceil(
    (new Date(data.checkOutDate!).getTime() - new Date(data.checkInDate!).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const totalAmount = (parseFloat(room.pricePerNight as string) * nights).toFixed(2);

  // Insert booking and get the inserted bookingId
  const [inserted] = await db
    .insert(bookingTable)
    .values({
      ...data,
      totalAmount,
      bookingStatus: "Pending"
    })
    .returning({ bookingId: bookingTable.bookingId });

  // Query the full booking with relations
  const fullBooking = await db.query.bookingTable.findFirst({
    where: eq(bookingTable.bookingId, inserted.bookingId),
    with: {
      user: true,
      room: {
        with: {
          hotel: true
        }
      },
      payment: true
    }
  });

  if (!fullBooking) throw new Error("Failed to retrieve created booking");

  return fullBooking;
};


export const checkRoomAvailabilityService = async (
  roomId: number,
  checkIn: string,
  checkOut: string
): Promise<boolean> => {
  const conflicts = await db.query.bookingTable.findMany({
    where: and(
      eq(bookingTable.roomId, roomId),
      eq(bookingTable.bookingStatus, "Confirmed"),
      and(
        lte(bookingTable.checkInDate, checkOut),
        gte(bookingTable.checkOutDate, checkIn)
      )
    )
  });

  return conflicts.length === 0;
};

export const updateBookingService = async (
  id: number,
  data: Partial<TBookingInsert>
): Promise<string> => {
  if (!data || Object.keys(data).length === 0) {
    throw new Error("No update data provided");
  }

  await db
    .update(bookingTable)
    .set({
      ...data,
      updatedAt: new Date()
    })
    .where(eq(bookingTable.bookingId, id));

  return "Booking updated successfully ✏️";
};

export const updateBookingStatusService = async (
  id: number,
  status: "Pending" | "Confirmed" | "Cancelled"
): Promise<string> => {
  await db.update(bookingTable).set({
    bookingStatus: status,
    updatedAt: new Date()
  }).where(eq(bookingTable.bookingId, id));

  const emoji = {
    Pending: "⏳",
    Confirmed: "✅",
    Cancelled: "❌"
  };

  return `Booking status updated to ${status} ${emoji[status]}`;
};

export const cancelBookingService = async (id: number) => {
  return await updateBookingStatusService(id, "Cancelled");
};

export const confirmBookingService = async (id: number) => {
  return await updateBookingStatusService(id, "Confirmed");
};

export const deleteBookingService = async (id: number): Promise<string> => {
  await db.delete(bookingTable).where(eq(bookingTable.bookingId, id));
  return "Booking deleted successfully ❌";
};

export const getBookingsByUserIdService = async (userId: number) => {
  return await db.query.bookingTable.findMany({
    where: eq(bookingTable.userId, userId),
    with: {
      user: {
        columns: {
          userId: true,
          firstName: true,
          lastName: true,
          email: true,
          contactPhone: true,
        }
      },
      room: {
        with: {
          hotel: {
            columns: {
              name: true,
              location: true,
              address: true,
            }
          }
        }
      },
      payment: true
    },
    orderBy: (bookingTable, { desc }) => [desc(bookingTable.createdAt)]
  });
};


export const getBookingByDateRangeService = async (startDate: string, endDate: string): Promise<TBookingSelect[] | null> => {
  return await db.query.bookingTable.findMany({
    where: and(
      gte(bookingTable.checkInDate, startDate),
      lte(bookingTable.checkOutDate, endDate)
    ),
    with: {
      user: {
        columns: {
          firstName: true,
          lastName: true,
          email: true
        }
      },
      room: {
        with: {
          hotel: {
            columns: {
              name: true,
              location: true
            }
          }
        }
      }
    },
    orderBy: (bookingTable, { asc }) => [asc(bookingTable.checkInDate)]
  });
};

export const getUpcomingCheckInsService = async (days = 7) => {
  const today = new Date();
  const future = new Date();
  future.setDate(today.getDate() + days);

  return await db.query.bookingTable.findMany({
    where: and(
      eq(bookingTable.bookingStatus, "Confirmed"),
      between(
        bookingTable.checkInDate,
        today.toISOString().split("T")[0],
        future.toISOString().split("T")[0]
      )
    ),
    with: {
      user: true,
      room: {
        with: {
          hotel: true
        }
      }
    },
    orderBy: (bookingTable, { asc }) => [asc(bookingTable.checkInDate)]
  });
};



export const updateBookingStatusToConfirmedService = async (
  bookingId: number
): Promise<TBookingSelect | undefined> => {
  const [updatedBooking] = await db
    .update(bookingTable)
    .set({ bookingStatus: "Confirmed", updatedAt: new Date() })
    .where(eq(bookingTable.bookingId, bookingId))
    .returning();

  return updatedBooking;
};



export const getUpcomingCheckOutsService = async (days = 7) => {
  const today = new Date();
  const future = new Date();
  future.setDate(today.getDate() + days);

  return await db.query.bookingTable.findMany({
    where: and(
      eq(bookingTable.bookingStatus, "Confirmed"),
      between(
        bookingTable.checkOutDate,
        today.toISOString().split("T")[0],
        future.toISOString().split("T")[0]
      )
    ),
    with: {
      user: true,
      room: {
        with: {
          hotel: true
        }
      }
    },
    orderBy: (bookingTable, { asc }) => [asc(bookingTable.checkOutDate)]
  });
};
