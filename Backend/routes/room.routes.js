import express from 'express';
import { checkUser } from '../utils/chekAuth.js';
import * as routes from '../controllers/room/room.controller.js'

const router = express.Router();

router.post('/create' , checkUser , routes.createRoom)
router.patch('/update/:id' , checkUser , routes.updateGroup)
router.delete('/delete/:id' , checkUser , routes.deleteRoom)

router.get('/get/:id' , checkUser , routes.getSingleRoom) 
router.get('/get' , checkUser , routes.getRooms) 

export default router;