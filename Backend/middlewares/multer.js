import multer from 'multer';

const storage = multer.diskStorage({
  destination : (req, file, cb) => {
    cb(null, 'uploads/');
  } ,
  filename : (req , file ,cb) => {
    cb(null , Date.now() + "-" + file.originalname)
  }
});

const upload = multer({storage});

const uploadFiles = upload.fields([
  {name : 'avatar' , maxCount : 1} ,
  {name : 'banner' , maxCount : 1} ,
  {name : 'media' , maxCount : 10} ,
])

export {uploadFiles}
