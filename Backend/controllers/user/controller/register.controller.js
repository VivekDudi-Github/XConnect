import { registerUserService } from "../services/register.services.js";
import { validateRegisterBody } from "../validator/register.validator.js";
import { ResError, ResSuccess, TryCatch } from "../../../utils/extra.js";

export const registerUser = TryCatch(async (req, res) => {
  const valid = validateRegisterBody(req, res);
  if (!valid) return;

  try {
    const user = await registerUserService(req.body);

    return ResSuccess(res, 201);
  } catch (err) {
    if (err.message === 'EMAIL_EXISTS')
      return ResError(res, 400, 'Email already exists');

    if (err.message === 'USERNAME_TAKEN')
      return ResError(res, 400, 'Username is not available');

    throw err;
  }
}, 'RegisterUser');
