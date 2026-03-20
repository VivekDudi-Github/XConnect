import express from 'express';
import { createMessage , getMessages , deleteMessage } from '../controllers/message/message.controller.js'

const router = express.Router();

/**
 * @swagger
 * /message/create:
 *   post:
 *     summary: Create message
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - room
 *               - message
 *             properties:
 *               room:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     room:
 *                       type: string
 *                     message:
 *                       type: string
 *                     sender:
 *                       type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /message/get:
 *   get:
 *     summary: Get messages of a room
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: room
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: _id
 *         required: true
 *         schema:
 *           type: string
 *         description: Pagination cursor / last message id
 *     responses:
 *       200:
 *         description: Messages fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /message/delete/{id}:
 *   delete:
 *     summary: Delete message
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
 *         description: Message deleted successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Internal server error
 */

router.post('/create' , createMessage)
router.get('/get' , getMessages)
router.delete('/delete/:id' , deleteMessage)

export default router;