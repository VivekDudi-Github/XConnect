import express from 'express' ;
import multer from 'multer';
import {checkUser} from '../utils/chekAuth.js'
import { uploadVideoChunk , InitVideoUpload , uploadStatusCheck, verifyUpload , getVideoDetails } from '../controllers/video/video.controller.js';

const router = express.Router() ;
const upload = multer({storage : multer.memoryStorage()})

router.get('/details/:public_id' , checkUser , getVideoDetails ) ;
router.get('/status/:public_id' ,checkUser , uploadStatusCheck ) ;
router.post('/verify/:public_id' , checkUser , verifyUpload) ;

router.post('/session' ,checkUser , InitVideoUpload ) ;
router.post('/chunk', checkUser ,  upload.single('chunk') , uploadVideoChunk ) ;


export default router ;

/**
 * @swagger
 * /video/details/{public_id}:
 *   get:
 *     summary: Get video details
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: public_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Fetched video details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Video'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /video/status/{public_id}:
 *   get:
 *     summary: Get video upload status
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: public_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Fetched video upload status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [processing, uploading, failed, completed]
 *                 totalChunks:
 *                   type: integer
 *                 chunks:
 *                   type: array
 *                   items:
 *                     type: integer
 *                 size:
 *                   type: number
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /video/verify/{public_id}:
 *   post:
 *     summary: Verify video upload
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: public_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Video verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [processing, uploading, failed, completed]
 *                 missingChunks:
 *                   type: array
 *                   items:
 *                     type: integer
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /video/session:
 *   post:
 *     summary: Initiate video upload
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fileSize
 *               - fileType
 *             properties:
 *               fileSize:
 *                 type: number
 *               fileType:
 *                 type: string
 *                 enum: [video]
 *     responses:
 *       200:
 *         description: Video upload initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 public_id:
 *                   type: string
 *                 _id:
 *                   type: string
 *                 chunkSize:
 *                   type: integer
 *                 totalChunks:
 *                   type: integer
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /video/chunk:
 *   post:
 *     summary: Upload video chunk
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - chunk
 *               - public_id
 *               - chunkIdx
 *             properties:
 *               chunk:
 *                 type: string
 *                 format: binary
 *               public_id:
 *                 type: string
 *               chunkIdx:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Video chunk uploaded successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Internal server error
 */
