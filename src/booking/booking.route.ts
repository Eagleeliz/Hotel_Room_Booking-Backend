import { Router } from "express";
import {
  getAllBookings,
  getBookingById,
  getBookingsByUserId,
  getBookingsByRoomId,
  getBookingsByStatus,
  getBookingsByDateRange,
  checkRoomAvailability,
  createNewBooking,
  updateBooking,
  updateBookingStatus,
  cancelBooking,
  confirmBooking,
  deleteBooking,
  getBookingWithCompleteDetails,
  getUserBookingHistory,
  getHotelBookingsStats,
  getUpcomingCheckIns,
  getUpcomingCheckOuts,
  updateBookingStatusToConfirmedController
} from "../booking/booking.controller";
import { adminOnly, anyAuthenticatedUser } from "../middleware/bearAuth";

export const BookingRouter = Router();

BookingRouter.get("/booking", getAllBookings);
BookingRouter.post("/booking",createNewBooking);
BookingRouter.get("/booking/search/date-range", getBookingsByDateRange);
BookingRouter.get("/booking/:id", getBookingById);
BookingRouter.put("/booking/:id", updateBooking);
BookingRouter.delete("/booking/:id", deleteBooking);

BookingRouter.patch("/booking/:id/status", updateBookingStatus);
BookingRouter.patch("/booking/:id/cancel", cancelBooking);
BookingRouter.patch("/booking/:id/confirm", confirmBooking);
BookingRouter.put("/:bookingId/confirm", updateBookingStatusToConfirmedController);

BookingRouter.get("/booking/user/:userId", getBookingsByUserId);
BookingRouter.get("/booking/room/:roomId",getBookingsByRoomId);
BookingRouter.get("/booking/status/:status", getBookingsByStatus);


BookingRouter.get("/booking/room/:roomId/availability", checkRoomAvailability);

BookingRouter.get("/booking/:id/details", getBookingWithCompleteDetails);
BookingRouter.get("/booking/user/:userId/history", getUserBookingHistory);

BookingRouter.get("/booking/hotel/:hotelId/stats", getHotelBookingsStats);

BookingRouter.get("/booking/reports/upcoming-checkins", getUpcomingCheckIns);
BookingRouter.get("/booking/reports/upcoming-checkouts", getUpcomingCheckOuts);

export default BookingRouter;
