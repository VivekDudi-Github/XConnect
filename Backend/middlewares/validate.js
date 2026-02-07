import { ZodError } from "zod";
import { ResError } from "../utils/extra.js";

export const validate = (schema, req) => {
  try {    
    let parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    return parsed;
  } 
  catch (err) {
    throw new ZodError(err.issues);
  }
};
