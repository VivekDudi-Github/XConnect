import express from "express";
import { checkUser } from "../utils/chekAuth.js";
import { uploadFiles} from "../middlewares/multer.js";

import {registerUser} from '../controllers/user/controller/register.controller.js' ;
import {getAnotherUser} from '../controllers/user/controller/getAnotherUser.controller.js' ;
import {getMe} from '../controllers/user/controller/getMe.controller.js' ;
import {loginUser , logoutUser} from '../controllers/user/controller/auth.controller.js' ;
import {updateUser} from '../controllers/user/controller/updateUser.controller.js' ;
import { changePassword } from "../controllers/user/controller/changePass.controller.js";
import {deleteUser} from '../controllers/user/controller/deleteUser.controller.js'
import {toggleFollow} from '../controllers/user/controller/toggleFollow.controller.js'
import {getMyNotifications , changeMYNotificationStatus} from '../controllers/user/controller/notification.controller.js'

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

router.post('/:id/follow' , checkUser , toggleFollow);


export default router;