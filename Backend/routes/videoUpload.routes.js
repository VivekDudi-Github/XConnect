import express from 'express' ;
import multer from 'multer';
import { uploadVideoChunk , InitVideoUpload , uploadStatusCheck } from '../controllers/upload.controller';

const router = express.Router() ;
const upload = multer({storage : multer.memoryStorage()})

router.get('/status/:uploadId' , uploadStatusCheck  )

router.post('/session' , InitVideoUpload ) ;
router.post('/chunk', upload.single('chunk') , uploadVideoChunk )


export default router ;