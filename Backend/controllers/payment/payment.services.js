import Stripe from "stripe";
import { paymentRepo } from "./payment.db.js";
import { io } from "../../app.js";
import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const paymentService = {
  async createSuperchatIntent({ user, streamId, message, amount }) {
    return stripe.paymentIntents.create({
      payment_method_types: ["card"],
      amount: amount * 100,
      currency: "inr",
      metadata: {
        type: "superchat",
        _id: user._id.toString(),
        username: user.username,
        avatar: user.avatar.url,
        streamId,
        message,
        amount: amount.toString(),
      },
    });
  },
  
  async handleSuperchatWebhook(metadata) {
    const {
      _id,
      username,
      avatar,
      streamId,
      message,
      amount,
    } = metadata;

    if (Number(amount) <= 0) return;

    const superChat = await paymentRepo.createSuperChat({
      sender: _id,
      message,
      roomId: streamId,
      isSuperChat: true,
      amount: Number(amount),
    });

    io.to(`liveStream:${streamId}`).emit("RECEIVE_LIVE_MESSAGE", {
      ...superChat.toObject(),
      sender: {
        _id,
        username,
        avatar: { url: avatar },
      },
    });
  },
};
