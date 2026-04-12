import express from "express";
import { checkUser } from "../utils/chekAuth.js";
import { uploadFiles} from "../middlewares/multer.js";

import {registerUser} from '../modules/user/controller/register.controller.js' ;
import {getAnotherUser} from '../modules/user/controller/getAnotherUser.controller.js' ;
import {getMe} from '../modules/user/controller/getMe.controller.js' ;
import {loginUser , logoutUser} from '../modules/user/controller/auth.controller.js' ;
import {updateUser} from '../modules/user/controller/updateUser.controller.js' ;
import { changePassword } from "../modules/user/controller/changePass.controller.js";
import {deleteUser} from '../modules/user/controller/deleteUser.controller.js'
import {toggleFollow} from '../modules/user/controller/toggleFollow.controller.js'
import {getMyNotifications , changeMYNotificationStatus} from '../modules/user/controller/notification.controller.js'


const router = express.Router();

router.get('/check-health' , (req , res) => {
    res.status(200).json({
        success: true,
        message: "Server is healthy"
    });
})


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

/**param
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
 *     description :  At least one of fullname, bio, location, hobby, avatar, or banner must be provided.
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
 *   delete:
 *     summary: Delete user
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500: 
 *         description : Internal server error
*/

/**
 * @swagger
 * /user/me/notifications:
 *   get:
 *     summary: get my notifications
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: fetched user notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         description: Internal server error
 *   patch:
 *     summary: change my notification status
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notificationId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Notification status changed successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Internal server error
*/

/**
 * @swagger
 * /user/me/password:
 *   put:
 *     summary: change user password
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /user/{username}:
 *   get:
 *     summary: get user by username
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
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
 */

/**
 * @swagger
 * /user/{id}/follow:
 *   post:
 *     summary: follow/unfollow user
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User follow toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/toggleResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         description: Internal server error
 */

