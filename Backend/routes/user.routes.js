import express from "express";
import { checkUser } from "../utils/chekAuth.js";
import { changePassword, deleteUser, getAnotherUser, getMe, loginUser, logoutUser, togglefollow, updateUser , getMyNotifications , changeMYNotificationStatus} from "../controllers/user.controller.js";
import { uploadFiles} from "../middlewares/multer.js";

import {registerUser} from '../controllers/user/controller/register..controller.js' ;

const router = express.Router();

router.get('/check-health' , (req , res) => {
    res.status(200).json({
        success: true,
        message: "Server is healthy"
    });
})

router.post('/signup' , registerUser);
router.post('/login' , loginUser);
router.get('/logout'  , logoutUser);

router.get('/me', checkUser, getMe);
router.patch('/me' , checkUser , uploadFiles , updateUser);
router.delete('/me' , checkUser , deleteUser);

router.patch('/me/notifications' , checkUser , changeMYNotificationStatus);
router.get('/me/notifications' , checkUser , getMyNotifications);
router.put('/me/password' , checkUser , changePassword);

router.get('/:username' , checkUser , getAnotherUser);

router.post('/:id/follow' , checkUser , togglefollow);


export default router;