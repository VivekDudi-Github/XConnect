import { ZodError } from "zod";
import { ResError } from "../utils/extra.js";

export const validate = (schema, req) => {
  try {
    console.log(req.body, ':body' , req.query , ':query' , req.params , ':params');
    
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
