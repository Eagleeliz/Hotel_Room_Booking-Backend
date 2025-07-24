import express, { Application, Response } from 'express';
import dotenv from 'dotenv';
import cors from "cors";
import { userRouter } from './users/user.route';
import { authRouter } from './auth/auth.route';
import { hotelRouter } from './hotels/hotel.route';
import roomRouter from './Rooms/room.route';
import supportTicketRouter from './SupportTickets/supportTicket.route';
import BookingRouter from './booking/booking.route';
import paymentRouter from './payments/payment.route';
import { handleStripeWebhook } from './payments/payment.controller'; // ✅ IMPORT WEBHOOK HANDLER


dotenv.config();

const app: Application = express();

// Basic Middleware
app.use(cors());

// ✅ Add Stripe Webhook Route FIRST (with raw body parsing)
app.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

// ✅ THEN add normal parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Default route
app.get('/', (req, res: Response) => {
  res.send("Welcome to Express API Backend WIth Drizzle ORM and PostgreSQL");
});

// Route mounting
app.use('/api', BookingRouter);
app.use('/api', userRouter);
app.use('/api', authRouter);
app.use('/api', hotelRouter);
app.use('/api', roomRouter);
app.use('/api', supportTicketRouter);
app.use('/api', paymentRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;
