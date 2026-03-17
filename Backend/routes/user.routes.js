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

/**
 * @swagger
 * /user/signup:
 *   post:
 *     summary: Create user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullname:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               username:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               username:
 *                 type: string 
 *             required:
 *               - password
 *             oneOf:
 *               - required: [email]
 *               - required: [username]
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /user/me:
 *   get:
 *     summary: get my profile
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: fetched user profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         description: Internal server error
 *   patch:
 *     summary : Update user profile
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fullname:
 *                 type: string
 *               bio:
 *                 type: string
 *               location:
 *                 type: string
 *               hobby:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: binary
 *               banner:
 *                 type: string
 *                 format : binary
 *             anyOf:
 *               - required: [fullname]
 *               - required: [bio]
 *               - required: [location]
 *               - required: [hobby]
 *               - required: [avatar]
 *               - required: [banner]
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         description: Internal server error
*/


router.post('/signup' , registerUser);
router.post('/login' , loginUser);

router.post('/logout' , checkUser  , logoutUser);
router.get('/me', checkUser, getMe);
router.patch('/me' , checkUser , uploadFiles , updateUser);
router.delete('/me' , checkUser , deleteUser);

router.patch('/me/notifications' , checkUser , changeMYNotificationStatus);
router.get('/me/notifications' , checkUser , getMyNotifications);
router.put('/me/password' , checkUser , changePassword);

router.get('/:username' , checkUser , getAnotherUser);

router.post('/:id/follow' , checkUser , toggleFollow);


export default router;