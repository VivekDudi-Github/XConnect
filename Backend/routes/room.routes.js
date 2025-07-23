import express from 'express';
import { checkUser } from '../utils/chekAuth.js';
import { createRoom , updateGroup , deleteRoom , getRooms , getSingleRoom } from '../controllers/room.controller.js'

const router = express.Router();

router.post('/create' , checkUser , createRoom)
router.patch('/update/:id' , checkUser , updateGroup)
router.delete('/delete/:id' , checkUser , deleteRoom)

router.get('/get/:id' , checkUser , getSingleRoom) 
router.get('/get' , checkUser , getRooms) 

export default router;