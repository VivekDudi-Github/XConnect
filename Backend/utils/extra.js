import fs from 'fs/promises';

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
        
        if(Array.isArray( req.CreatePostMediaForDelete) && req.CreatePostMediaForDelete.length > 0){
          await Promise.allSettled(
            req.CreatePostMediaForDelete.map(f => fs.unlink(f.path).catch(err => console.error('Cleanup error:', err)))
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