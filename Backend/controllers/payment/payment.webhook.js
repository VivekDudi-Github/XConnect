import Stripe from "stripe";
import { paymentService } from "./payment.services.js";
import { stripeMetadataSchema } from "./payment.validator.js";
import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhookHandler = async (req, res) => {
  const signature = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.WEBHOOK_KEY
    );
  } catch (err) {
    console.error("Stripe webhook verification failed:", err.message);
    return res.sendStatus(400);
  }

  if (event.type === "payment_intent.succeeded") {
    const metadata = event.data.object.metadata;

    const parsed = stripeMetadataSchema.safeParse(metadata);
    if (parsed.success && parsed.data.type === "superchat") {
      await paymentService.handleSuperchatWebhook(parsed.data);
    }
  }

  return res.sendStatus(200);
};
