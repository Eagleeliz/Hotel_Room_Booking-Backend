// src/controllers/bookingController.ts
import { Request, Response } from 'express';
import {
  getAllBookingsService,
  getBookingByIdService,
  getBookingsByUserIdService,
  getBookingsByRoomIdService,
  getBookingsByStatusService,
  getBookingByDateRangeService,
  checkRoomAvailabilityService,
  createNewBookingService,
  updateBookingService,
  updateBookingStatusService,
  cancelBookingService,
  confirmBookingService,
  deleteBookingService,
  getBookingWithCompleteDetailsService,
  getUserBookingHistoryService,
  getHotelBookingsStatsService,
  getUpcomingCheckInsService,
  getUpcomingCheckOutsService
} from '../booking/booking.service'; // Adjust path as per your project structure

// Get all bookings
export const getAllBookings = async (_req: Request, res: Response): Promise<void> => {
  try {
    const bookings = await getAllBookingsService();
    if (!bookings?.length) {
      res.status(404).json({ message: "No bookings available" });
      return;
    }
    res.status(200).json(bookings);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch bookings" });
  }
};

// Get booking by ID
export const getBookingById = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid booking ID format" });
    return;
  }

  try {
    const booking = await getBookingByIdService(id);
    if (!booking) {
      res.status(404).json({ message: "Booking not found with the provided ID" });
      return;
    }
    res.status(200).json(booking);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch booking details" });
  }
};

// Get bookings by user ID
export const getBookingsByUserId = async (req: Request, res: Response): Promise<void> => {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid user ID format" });
    return;
  }

  try {
    const bookings = await getBookingsByUserIdService(userId);
    if (!bookings?.length) {
      res.status(404).json({ message: "No bookings found for this user" });
      return;
    }
    res.status(200).json(bookings);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch user bookings" });
  }
};

// Get bookings by room ID
export const getBookingsByRoomId = async (req: Request, res: Response): Promise<void> => {
  const roomId = parseInt(req.params.roomId);
  if (isNaN(roomId)) {
    res.status(400).json({ error: "Invalid room ID format" });
    return;
  }

  try {
    const bookings = await getBookingsByRoomIdService(roomId);
    if (!bookings?.length) {
      res.status(404).json({ message: "No bookings found for this room" });
      return;
    }
    res.status(200).json(bookings);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch room bookings" });
  }
};

// Get bookings by status
export const getBookingsByStatus = async (req: Request, res: Response): Promise<void> => {
  const status = req.params.status;
  // Manual validation for status enum
  if (!['Pending', 'Confirmed', 'Cancelled'].includes(status)) {
    res.status(400).json({ error: "Invalid booking status. Must be: Pending, Confirmed, or Cancelled" });
    return;
  }

  try {
    const bookings = await getBookingsByStatusService(status as "Pending" | "Confirmed" | "Cancelled");
    if (!bookings?.length) {
      res.status(404).json({ message: `No ${status.toLowerCase()} bookings available` });
      return;
    }
    res.status(200).json(bookings);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch bookings by status" });
  }
};

// Get bookings by date range
export const getBookingsByDateRange = async (req: Request, res: Response): Promise<void> => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    res.status(400).json({ error: "Both startDate and endDate query parameters are required" });
    return;
  }

  // Basic date format validation
  if (isNaN(Date.parse(startDate as string)) || isNaN(Date.parse(endDate as string))) {
    res.status(400).json({ error: "Invalid date format. Please use ISO format (YYYY-MM-DD)" });
    return;
  }

  try {
    const bookings = await getBookingByDateRangeService(startDate as string, endDate as string);
    if (!bookings?.length) {
      res.status(404).json({ message: "No bookings found within the specified date range" });
      return;
    }
    res.status(200).json(bookings);
    console.log(bookings)
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch bookings for date range" });
  }
};

// Check room availability
export const checkRoomAvailability = async (req: Request, res: Response): Promise<void> => {
  const roomId = parseInt(req.params.roomId);
  const { checkInDate, checkOutDate } = req.query;

  if (isNaN(roomId) || !checkInDate || !checkOutDate) {
    res.status(400).json({ error: "Room ID, checkInDate and checkOutDate are all required" });
    return;
  }

  if (isNaN(Date.parse(checkInDate as string)) || isNaN(Date.parse(checkOutDate as string))) {
    res.status(400).json({ error: "Invalid date format. Please use ISO format (YYYY-MM-DD)" });
    return;
  }

  if (new Date(checkInDate as string) >= new Date(checkOutDate as string)) {
    res.status(400).json({ error: "Check-out date must be after check-in date" });
    return;
  }

  try {
    const isAvailable = await checkRoomAvailabilityService(roomId, checkInDate as string, checkOutDate as string);
    res.status(200).json({
      roomId,
      checkInDate,
      checkOutDate,
      isAvailable,
      message: isAvailable ? "Room is available for booking" : "Room is not available for the selected dates"
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to check room availability" });
  }
};

// Create new booking
export const createNewBooking = async (req: Request, res: Response): Promise<void> => {
  const bookingData = req.body;
  // Removed 'numberOfGuests' as per your schema
  const requiredFields = ['userId', 'roomId', 'checkInDate', 'checkOutDate'];
  const missing = requiredFields.filter(f => !bookingData[f]);

  if (missing.length > 0) {
    res.status(400).json({ error: `Missing required fields: ${missing.join(", ")}` });
    return;
  }

  // Ensure userId, roomId are numbers. Removed numberOfGuests validation.
  if (isNaN(parseInt(bookingData.userId)) || isNaN(parseInt(bookingData.roomId))) {
      res.status(400).json({ error: "userId and roomId must be valid numbers." });
      return;
  }

  if (new Date(bookingData.checkInDate) >= new Date(bookingData.checkOutDate)) {
    res.status(400).json({ error: "Check-out date must be after check-in date" });
    return;
  }

  if (new Date(bookingData.checkInDate) < new Date()) {
    res.status(400).json({ error: "Check-in date cannot be in the past" });
    return;
  }

  try {
    const message = await createNewBookingService(bookingData);
    res.status(201).json({ message });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create booking" });
  }
};

// Update booking
export const updateBooking = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  const bookingData = req.body;

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid booking ID format" });
    return;
  }

  // Check if any update data is actually provided
  if (Object.keys(bookingData).length === 0) {
    res.status(400).json({ error: "No update data provided" });
    return;
  }

  // Validate number fields if present (removed numberOfGuests)
  if (bookingData.userId !== undefined && isNaN(parseInt(bookingData.userId))) {
      res.status(400).json({ error: "Invalid userId format." }); return;
  }
  if (bookingData.roomId !== undefined && isNaN(parseInt(bookingData.roomId))) {
      res.status(400).json({ error: "Invalid roomId format." }); return;
  }

  if (bookingData.checkInDate && isNaN(Date.parse(bookingData.checkInDate))) {
    res.status(400).json({ error: "Invalid check-in date format. Please use ISO format (YYYY-MM-DD)" });
    return;
  }

  if (bookingData.checkOutDate && isNaN(Date.parse(bookingData.checkOutDate))) {
    res.status(400).json({ error: "Invalid check-out date format. Please use ISO format (YYYY-MM-DD)" });
    return;
  }

  if (
    bookingData.checkInDate &&
    bookingData.checkOutDate &&
    new Date(bookingData.checkInDate) >= new Date(bookingData.checkOutDate)
  ) {
    res.status(400).json({ error: "Check-out date must be after check-in date" });
    return;
  }

  try {
    const message = await updateBookingService(id, bookingData);
    res.status(200).json({ message });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update booking" });
  }
};

// Update booking status
export const updateBookingStatus = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  const { status } = req.body;

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid booking ID format" });
    return;
  }

  if (!status) {
    res.status(400).json({ error: "Booking status is required" });
    return;
  }

  if (!['Pending', 'Confirmed', 'Cancelled'].includes(status)) {
    res.status(400).json({ error: "Invalid status. Must be one of: Pending, Confirmed, or Cancelled" });
    return;
  }

  try {
    const message = await updateBookingStatusService(id, status as "Pending" | "Confirmed" | "Cancelled");
    res.status(200).json({ message });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update booking status" });
  }
};

// Cancel booking
export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid booking ID format" });
    return;
  }

  try {
    const message = await cancelBookingService(id);
    res.status(200).json({ message });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to cancel booking" });
  }
};

// Confirm booking
export const confirmBooking = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid booking ID format" });
    return;
  }

  try {
    const message = await confirmBookingService(id);
    res.status(200).json({ message });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to confirm booking" });
  }
};

// Delete booking
export const deleteBooking = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid booking ID format" });
    return;
  }

  try {
    const message = await deleteBookingService(id);
    res.status(200).json({ message });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete booking" });
  }
};

// Get booking with complete details
export const getBookingWithCompleteDetails = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid booking ID format" });
    return;
  }

  try {
    // Calling getBookingByIdService as it already fetches complete details per your service file
    const booking = await getBookingByIdService(id);
    if (!booking) {
      res.status(404).json({ message: "Booking details not found" });
      return;
    }
    res.status(200).json(booking);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch complete booking details" });
  }
};

// Get user booking history
export const getUserBookingHistory = async (req: Request, res: Response): Promise<void> => {
  const userId = parseInt(req.params.userId);

  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid user ID format" });
    return;
  }

  try {
    const data = await getUserBookingHistoryService(userId);
    if (!data?.length) { // Check for length as service returns array
      res.status(404).json({ message: "No booking history found for this user" });
      return;
    }
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch user booking history" });
  }
};

// Get hotel bookings stats
export const getHotelBookingsStats = async (req: Request, res: Response): Promise<void> => {
  const hotelId = parseInt(req.params.hotelId);

  if (isNaN(hotelId)) {
    res.status(400).json({ error: "Invalid hotel ID format" });
    return;
  }

  try {
    const stats = await getHotelBookingsStatsService(hotelId);
    if (!stats?.length) {
      res.status(404).json({ message: "No booking statistics available for this hotel" });
      return;
    }
    res.status(200).json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch hotel booking statistics" });
  }
};

// Get upcoming check-ins
export const getUpcomingCheckIns = async (req: Request, res: Response): Promise<void> => {
  const days = parseInt(req.query.days as string || "7"); // Default to "7" if not provided

  if (isNaN(days) || days < 1) {
    res.status(400).json({ error: "Days parameter must be a positive integer" });
    return;
  }

  try {
    const checkIns = await getUpcomingCheckInsService(days);
    if (!checkIns?.length) {
      res.status(404).json({ message: `No upcoming check-ins found for the next ${days} days` });
      return;
    }

    res.status(200).json({
      period: `Next ${days} days`,
      count: checkIns.length,
      checkIns,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch upcoming check-ins" });
  }
};

// Get upcoming check-outs
export const getUpcomingCheckOuts = async (req: Request, res: Response): Promise<void> => {
  const days = parseInt(req.query.days as string || "7"); // Default to "7" if not provided

  if (isNaN(days) || days < 1) {
    res.status(400).json({ error: "Days parameter must be a positive integer" });
    return;
  }

  try {
    const checkOuts = await getUpcomingCheckOutsService(days);
    if (!checkOuts?.length) {
      res.status(404).json({ message: `No upcoming check-outs found for the next ${days} days` });
      return;
    }

    res.status(200).json({
      period: `Next ${days} days`,
      count: checkOuts.length,
      checkOuts,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch upcoming check-outs" });
  }
};