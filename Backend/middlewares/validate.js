import { ZodError } from "zod";
import { ResError } from "../utils/extra.js";

export const validate = (schema, req) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
  } catch (err) {
    if (err instanceof ZodError) {
      const message = err.errors
        .map(e => e.message)
        .join(", ");

      return ResError(req.res, 400, message);
    }
    throw err;
  }
};
