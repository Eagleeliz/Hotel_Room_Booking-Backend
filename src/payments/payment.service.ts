import { eq, desc } from "drizzle-orm";
import db from "../drizzle/db";
import { paymentTable, bookingTable } from "../drizzle/schema";
import type {
  TPaymentInsert,
  TPaymentSelect,
  TBookingSelect,
} from "../drizzle/schema";

// ✅ Create new payment
export const createHotelPaymentService = async (
  payment: TPaymentInsert
): Promise<TPaymentSelect | undefined> => {
  const [newPayment] = await db.insert(paymentTable).values(payment).returning();

  // Update booking status if payment is completed and bookingId is present
  if (
    payment.paymentStatus === "Completed" &&
    payment.bookingId !== undefined &&
    payment.bookingId !== null
  ) {
    await db
      .update(bookingTable)
      .set({ bookingStatus: "Confirmed" })
      .where(eq(bookingTable.bookingId, payment.bookingId));
  }

  return newPayment;
};

// ✅ Get all payments with booking, user, and room
export const getAllHotelPaymentsService = async (
  page: number,
  pageSize: number
): Promise<TPaymentSelect[] | null> => {
  const list = await db.query.paymentTable.findMany( {
    with: {
      booking: {
        with: {
          user: { columns: { password: false } },
          room: {
            with: {
              hotel: true, // ✅ This line is crucial
            },
          },
        },
      },
    },
    orderBy: desc(paymentTable.paymentId),
    offset: (page - 1) * pageSize,
    limit: pageSize,
  });

  return list;
};


// ✅ Get a single payment by ID
export const getHotelPaymentByIdService = async (
  paymentId: number
): Promise<TPaymentSelect | undefined> => {
  return await db.query.paymentTable.findFirst({
    where: eq(paymentTable.paymentId, paymentId),
    with: {
      booking: {
        with: {
          user: { columns: { password: false } },
          room: true,
        },
      },
    },
  });
};

// ✅ Get all payments for a specific user
// services/paymentService.ts or similar
export const getHotelPaymentsByUserIdService = async (
  userId: number,
  page: number,
  pageSize: number
): Promise<TBookingSelect[] | null> => {
  const bookingsWithPayments = await db.query.bookingTable.findMany({
    where: eq(bookingTable.userId, userId),
    with: {
      payment: true,
      user: {
        columns: {
          password: false,
        },
      },
      room: {
        with: {
          hotel: true, // ✅ include the hotel related to the room
        },
      },
    },
    orderBy: desc(bookingTable.bookingId),
    offset: (page - 1) * pageSize,
    limit: pageSize,
  });

  return bookingsWithPayments;
};



// ✅ Delete payment by ID
export const deleteHotelPaymentService = async (
  paymentId: number
): Promise<string> => {
  await db.delete(paymentTable).where(eq(paymentTable.paymentId, paymentId));
  return "Payment deleted successfully";
};

//update status by paymentId
export const updateHotelPaymentStatusService = async (
  paymentId: number,
  status: "Pending" | "Completed" | "Failed"
) => {
  return db
    .update(paymentTable)
    .set({ paymentStatus: status }) // ✅ Type-safe now
    .where(eq(paymentTable.paymentId, paymentId))
    .returning();
};
