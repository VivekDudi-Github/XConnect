import express from 'express';
import { createMessage , getMessages , deleteMessage } from '../controllers/message/message.controller.js'

const router = express.Router();

router.post('/create' , createMessage)
router.get('/get' , getMessages)
router.delete('/delete/:id' , deleteMessage)

export default router;