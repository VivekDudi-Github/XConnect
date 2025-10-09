import express from "express";
import { createLiveStream , deleteLiveStream , updateLiveStream , getLiveStream , getUserLiveStreams , getLiveChats } from "../controllers/liveStream.controller.js";  
import {checkUser} from '../utils/chekAuth.js'
import { uploadFiles } from "../middlewares/multer.js";


const router = express.Router();

router.post('/create/' , checkUser , uploadFiles , createLiveStream) ;
router.delete('/delete/:id' , checkUser , deleteLiveStream) ;
router.patch('/update/:id' , checkUser , uploadFiles , updateLiveStream) ;
router.get('/get/:id' , checkUser , getLiveStream) ;
router.get('/getUser/:id' , checkUser , getUserLiveStreams) ;
router.get('/getChats/:id' , checkUser , getLiveChats) ;



export default router;