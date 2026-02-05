import fsAsync from 'fs/promises';
import fs from 'fs';
import { ZodError } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const ResError = (res , statusCode , message) => {
  return res.status(statusCode).json({
      success : false ,
      message
  })
}
const ResSuccess = (res ,statusCode , data) => {
  res.status(statusCode).json({
      success: true,
      data: data
  })
} 

const TryCatch = (func , funcName ) => {
  return async function (req, res, next) {
      try {
          await func(req, res, next);
      } catch (error) {
          if (error instanceof ZodError) {
            const message = error.issues
              .map(e => e.message)
              .join(", ");

            return ResError(req.res, 400, message);
          } else if (error.statusCode) ResError(res, error.statusCode, error.message);
          else {
            console.log(`Error in ${funcName}:`, error);
            return ResError(res, error.statusCode || 500 , `Internal Server Error`);
          }
        } finally {
        
        if(Array.isArray( req.CreateMediaForDelete) && req.CreateMediaForDelete.length > 0){
          await Promise.allSettled(
            req.CreateMediaForDelete.map(async(f , i) => {
              console.log(f.path , i);
              if(fs.existsSync(f?.path)) return fsAsync.unlink(f.path).catch(err => console.error('Cleanup error:', err))
            })
          )
        }
      }
  }
}

const generateTokens = async (user) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();

  return { accessToken, refreshToken };
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
};

export { 
  TryCatch ,
  ResError ,
  ResSuccess ,
  cookieOptions ,
  generateTokens ,
}
