import { ZodError } from "zod";
import { ResError } from "../utils/extra.js";

export const validate = (schema, req) => {
  try {    
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
  } 
  catch (err) {
    throw err;
  }
};
