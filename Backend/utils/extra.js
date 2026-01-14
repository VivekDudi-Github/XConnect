import fsAsync from 'fs/promises';
import fs from 'fs';

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
          console.log(`Error in ${funcName}:`, error);
          return ResError(res, 500, `Internal Server Error`);
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





export { 
  TryCatch ,
  ResError ,
  ResSuccess ,
}