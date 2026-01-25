import { ZodError } from "zod";
import { ResError } from "../utils/extra.js";

export const validate = (schema, req) => {
  try {
    console.log(req.body , req.query , req.params);
    
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
