import { paymentService } from "./payment.services.js";
import { createSuperchatSchema } from "./payment.validator.js";
import { ResError, ResSuccess } from "../../utils/extra.js";

export const createSuperchatPayment = async (req, res) => {
  const parsed = createSuperchatSchema.safeParse(req.body);

  if (!parsed.success) {
    return ResError(res, 400, parsed.error.issues[0]);
  }

  const { streamId, message, amount } = parsed.data;

  const intent = await paymentService.createSuperchatIntent({
    user: req.user,
    streamId,
    message,
    amount,
  });

  return ResSuccess(res, 200, intent.client_secret);
};
