import express from 'express' ;
import { checkUser } from '../utils/checkAuth.js';
import * as routes from '../modules/comment/comment.controller.js';

const router = express.Router() ;
/**
 * @swagger
 * /comment/{id}:
 *   post:
 *     summary: Create a comment
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
 *               content:
 *                 type: string
 *               comment_id:
 *                 type: string
 *                 description: Only required if replying to a comment
 *                 example: 5f8d9f1d8a9b5e7b0f2f3ca(only required if it's a reply to a comment)
 *               mentions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   type: string
 *                 comment_id:
 *                   type: string
 *                   description: Only required if replying to a comment
 *                 mentions:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Internal server error
 *
 *   get:
 *     summary: Get a single comment
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
 *         description: Fetched comment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Internal server error
 *
 *   delete:
 *     summary: Delete a comment
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
 *         description: Comment deleted successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /comment/post/{id}:
 *   get:
 *     summary: Get comments
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: comment_id
 *         schema:
 *           type: string
 *         description: Required for fetching replies on a comment
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [Top, Most Likes, Newest]
 *       - in: query
 *         name: isComment
 *         schema:
 *           type: boolean
 *         description: Only required if fetching comment replies
 *     responses:
 *       200:
 *         description: Fetched comments successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 comments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 *                 totalComments:
 *                   type: number
 *                 totalPages:
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
 * /comment/like/{id}:
 *   post:
 *     summary: Like a comment
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
 *         description: Comment liked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/toggleResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /comment/dislike/{id}:
 *   post:
 *     summary: Dislike a comment
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
 *         description: Comment disliked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/toggleResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Internal server error
 */

router.post('/:id' , checkUser , routes.createComment) ;
router.get('/post/:id' , checkUser , routes.getComments) ;

router.get('/:id' , checkUser , routes.getAComment) ;

router.post('/like/:id' , checkUser , routes.toggleLikeComment) ;
router.post('/dislike/:id' , checkUser , routes.toggleDislikeComment) ;

router.delete('/:id' , checkUser , routes.deleteComment) ;

export default router ;