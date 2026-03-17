import multer from 'multer';
import ApiError from '../utils/ApiError.js';

const storage = multer.diskStorage({
  destination : (req, file, cb) => {
    cb(null, 'uploads/');
  } ,
  filename : (req , file ,cb) => {
    cb(null , Date.now() + "-" + file.originalname)
  }
});

const upload = multer({
  storage ,
  limits: { 
    fileSize: 1 * 1024 * 1024 // 5MB limit
  }, 
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const isMimeValid = allowedTypes.test(file.mimetype);
    const isExtValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (isMimeValid && isExtValid) {
      return cb(null, true);
    }
    cb(new ApiError(400 ,'Only .png, .jpg, .jpeg and .pdf formats are allowed!'));
  }
});

const uploadFiles = upload.fields([
  {name : 'avatar' , maxCount : 1} ,
  {name : 'banner' , maxCount : 1} ,
  {name : 'media' , maxCount : 10} ,
])

export {uploadFiles}
