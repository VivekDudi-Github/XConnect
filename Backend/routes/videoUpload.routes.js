import express from 'express' ;
import multer from 'multer';
import {checkUser} from '../utils/chekAuth.js'
import { uploadVideoChunk , InitVideoUpload , uploadStatusCheck, verifyUpload } from '../controllers/upload.controller.js';

const router = express.Router() ;
const upload = multer({storage : multer.memoryStorage()})

router.get('/status/:uploadId' ,checkUser , uploadStatusCheck ) ;
router.post('/verify/:uploadId' , checkUser , verifyUpload) ;

router.post('/session' ,checkUser , InitVideoUpload ) ;
router.post('/chunk', checkUser ,  upload.single('chunk') , uploadVideoChunk ) ;


export default router ;