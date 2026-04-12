import express from 'express';
import { checkUser } from '../utils/chekAuth.js';
import * as routes from '../modules/room/room.controller.js'

const router = express.Router();

/**
 * @swagger
 * /room/create:
 *   post:
 *     summary: Create new messaging room
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [group, one-on-one]
 *               members:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Room created successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /room/update/{id}:
 *   patch:
 *     summary: Update messaging room details
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               members:
 *                 type: array
 *                 items:
 *                   type: string
 *               removeMembers:
 *                 type: array
 *                 items:
 *                   type: string
 *               promotions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Room updated successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /room/delete/{id}:
 *   delete:
 *     summary: Delete room
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
 *         description: Room deleted successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /room/get/{id}:
 *   get:
 *     summary: Get single room
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
 *         description: Fetched room
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 type:
 *                   type: string
 *                   enum: [group, one-on-one]
 *                 members:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 admins:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 archivedBy:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /room/get:
 *   get:
 *     summary: Get rooms
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Fetched rooms
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   type:
 *                     type: string
 *                     enum: [group, one-on-one]
 *                   members:
 *                     type: array
 *                     items:
 *                       type: string
 *                   admins:
 *                     type: array
 *                     items:
 *                       type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Internal server error
 */

router.post('/create' , checkUser , routes.createRoom)
router.patch('/update/:id' , checkUser , routes.updateGroup)
router.delete('/delete/:id' , checkUser , routes.deleteRoom)

router.get('/get/:id' , checkUser , routes.getSingleRoom) 
router.get('/get' , checkUser , routes.getRooms) 

export default router;