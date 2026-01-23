import { LiveChat } from "../../models/liveChats.model.js";

export const paymentRepo = {
  createSuperChat(data) {
    return LiveChat.create(data);
  },
};
