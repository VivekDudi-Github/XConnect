import express from "express";
import * as routes from "../controllers/liveStream/liveStream.controller.js";  
import {checkUser} from '../utils/chekAuth.js'
import { uploadFiles } from "../middlewares/multer.js";


const router = express.Router();

router.post('/create/' , checkUser , uploadFiles , routes.createLiveStream) ;
router.delete('/:id' , checkUser , routes.deleteLiveStream) ;
router.patch('/update/:id' , checkUser , uploadFiles , routes.updateLiveStream) ;
router.get('/:id' , checkUser , routes.getLiveStream) ;
router.get('/getUser/:id' , checkUser , routes.getUserLiveStreams) ;
router.get('/getChats/:id' , checkUser , routes.getLiveChats) ;



export default router;