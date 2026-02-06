import { ZodError } from "zod";
import { ResError } from "../utils/extra.js";

export const validate = (schema, req) => {
  try {    
    let res = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
  } 
  catch (err) {
    throw new ZodError(err.issues);
  }
};
