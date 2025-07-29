import { Router } from "express";
import {
  createPayment,
  deletePayment,
  getAllPayments,
  getPaymentById,
  getPaymentsByUserId,
  createCheckoutSession,
  handleStripeWebhook,
  updatePaymentStatus // ✅ Make sure this is imported
} from "./payment.controller";

import { pagination } from "../middleware/pagination";

const paymentRouter = Router();
// ✅ PATCH route for updating payment status
paymentRouter.patch("/payments/status", updatePaymentStatus); 


// 🔍 Get all payments with pagination
paymentRouter.get("/payments", pagination, getAllPayments);

// 👤 Get payments by user ID
paymentRouter.get("/payments/user/:userId", getPaymentsByUserId);

// 📄 Get a specific payment
paymentRouter.get("/payments/:paymentId", getPaymentById);

// ➕ Create a manual payment record
paymentRouter.post("/payments", createPayment);

// ❌ Delete a payment
paymentRouter.delete("/payments/:paymentId", deletePayment);

// 💳 Stripe checkout session
paymentRouter.post("/payments/create-checkout-session", createCheckoutSession);

// 🪝 Stripe webhook handler
paymentRouter.post("/payments/webhook", handleStripeWebhook);



export default paymentRouter;
