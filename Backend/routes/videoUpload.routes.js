import express from 'express' ;
import multer from 'multer';
import { uploadVideoChunk } from '../controllers/upload.controller';

const router = express.Router() ;
const upload = multer({storage : multer.memoryStorage()})

router.post('/upload/video/session' , videoInit ) ;
router.post('/upload/video/chunk', upload.single('chunk') , uploadVideoChunk )


export default router ;