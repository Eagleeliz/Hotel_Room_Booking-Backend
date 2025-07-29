import { Request, Response } from "express";
import Stripe from "stripe";
import {
  createHotelPaymentService,
  deleteHotelPaymentService,
  getAllHotelPaymentsService,
  getHotelPaymentByIdService,
  getHotelPaymentsByUserIdService,
  updateHotelPaymentStatusService,
} from "../payments/payment.service";
import { updateBookingStatusToConfirmedService } from "../booking/booking.service";

// ✅ Stripe instance using correct API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

// ✅ Create a payment manually (not via Stripe)
export const createPayment = async (req: Request, res: Response) => {
  try {
    const payment = await createHotelPaymentService(req.body);
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: "Failed to create payment", error });
  }
};

// ✅ Stripe Checkout Session Creator
export const createCheckoutSession = async (req: Request, res: Response) => {
  const { amount, bookingId } = req.body;

  if (!amount || isNaN(amount)) {
     res.status(400).json({ error: "Invalid payment amount" });
     return
  }
  console.log(bookingId)

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: Number(amount), // Stripe expects number in cents
            product_data: {
              name: "Hotel Booking Payment",
              description: "Payment for hotel booking",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId: bookingId?.toString() || "",
      },
      success_url: "http://localhost:5173/dashboard/orders",
      cancel_url: "http://localhost:5173/payment-cancelled",
    });

    res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error("❌ Stripe session creation error:", err);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
};

//  Stripe Webhook to confirm payment and update booking
export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    const rawBody = (req as any).rawBody || req.body;
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("❌ Webhook verification failed:", err.message);
 res.status(400).send(`Webhook Error: ${err.message}`);
    return 
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;
    const transactionId = session.payment_intent as string;


    if (bookingId) {
      try {
        console.log(bookingId)
        await createHotelPaymentService({
          amount: ((session.amount_total || 0) / 100).toString(), // store in dollars
          paymentStatus: "Completed",
          paymentMethod: "Card",
          bookingId: parseInt(bookingId),
          transactionId: transactionId
        });

        await updateBookingStatusToConfirmedService(parseInt(bookingId));
        console.log(`✅ Booking ${bookingId} confirmed and payment recorded`);
      } catch (err) {
        console.error(`❌ Error updating booking/payment for ${bookingId}:`, err);
      }
    }
  }

  res.status(200).json({ received: true });
};

// ✅ Get all payments (paginated)
export const getAllPayments = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;

  try {
    const result = await getAllHotelPaymentsService(page, pageSize);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payments", error });
  }
};


// ✅ Get payment by ID
export const getPaymentById = async (req: Request, res: Response) => {
  const paymentId = parseInt(req.params.paymentId);

  try {
    const payment = await getHotelPaymentByIdService(paymentId);
    if (!payment)  res.status(404).json({ message: "Payment not found" });
    return

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payment", error });
  }
};

// ✅ Get all payments by user
export const getPaymentsByUserId = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;

  try {
    const result = await getHotelPaymentsByUserIdService(userId, page, pageSize);

    // 🔍 Log the result for debugging
    console.log("📦 Booking + Payment Data:", JSON.stringify(result, null, 2));

    res.json(result);
  } catch (error) {
    console.error("❌ Error fetching user payments:", error);
    res.status(500).json({ message: "Error fetching user payments", error });
  }
};


// ✅ Delete payment by ID
export const deletePayment = async (req: Request, res: Response) => {
  const paymentId = parseInt(req.params.paymentId);

  try {
    const result = await deleteHotelPaymentService(paymentId);
    res.json({ message: result });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete payment", error });
  }
};
// update using the payment id
export const updatePaymentStatus = async (req: Request, res: Response) => {
  const paymentId = parseInt(req.body.paymentId);
  const status = req.body.status;

  if (!paymentId || !["Pending", "Completed", "Failed"].includes(status)) {
     res.status(400).json({ message: "Invalid payment ID or status" });
     return
  }

  try {
    const result = await updateHotelPaymentStatusService(paymentId, status);
    res.status(200).json({ message: "Payment status updated", result });
  } catch (error) {
    res.status(500).json({ message: "Error updating payment status", error });
  }
};

