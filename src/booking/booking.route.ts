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
  getUpcomingCheckOuts
} from "../booking/booking.controller";
import { adminOnly, anyAuthenticatedUser } from "../middleware/bearAuth";

export const BookingRouter = Router();

BookingRouter.get("/booking",adminOnly, getAllBookings);
BookingRouter.post("/booking",anyAuthenticatedUser,createNewBooking);
BookingRouter.get("/booking/search/date-range",adminOnly, getBookingsByDateRange);
BookingRouter.get("/booking/:id", getBookingById);
BookingRouter.put("/booking/:id", anyAuthenticatedUser,updateBooking);
BookingRouter.delete("/booking/:id", deleteBooking);

BookingRouter.patch("/booking/:id/status", adminOnly,updateBookingStatus);
BookingRouter.patch("/booking/:id/cancel", adminOnly,cancelBooking);
BookingRouter.patch("/booking/:id/confirm",adminOnly, confirmBooking);

BookingRouter.get("/booking/user/:userId", adminOnly,getBookingsByUserId);
BookingRouter.get("/booking/room/:roomId", adminOnly,getBookingsByRoomId);
BookingRouter.get("/booking/status/:status",adminOnly, getBookingsByStatus);


BookingRouter.get("/booking/room/:roomId/availability", anyAuthenticatedUser,checkRoomAvailability);

BookingRouter.get("/booking/:id/details", getBookingWithCompleteDetails);
BookingRouter.get("/booking/user/:userId/history", getUserBookingHistory);

BookingRouter.get("/booking/hotel/:hotelId/stats", getHotelBookingsStats);

BookingRouter.get("/booking/reports/upcoming-checkins", getUpcomingCheckIns);
BookingRouter.get("/booking/reports/upcoming-checkouts", getUpcomingCheckOuts);

export default BookingRouter;
