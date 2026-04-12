import { uploadFiles} from "../middlewares/multer.js";
import express from "express";
import { checkUser } from "../utils/chekAuth.js";
import parseMultipartFields from "../middlewares/parseMultiPart.js";

import * as routes from '../modules/post/routes.index.js'


const router = express.Router();

router.post('/' , checkUser , uploadFiles ,parseMultipartFields,  routes.createPost);


router.get('/user/' , checkUser , routes.getUserPosts);
router.post('/toggle/:id' , checkUser , routes.toggleOnPost );
router.post('/increaseViews/:id' , checkUser , routes.increasePostViews );
router.get('/trending' , checkUser , routes.fetchExplorePost );

router.get('/me/feed/' , checkUser , routes.fetchFeedPost ) ;

router.get('/:id' , checkUser , routes.getPost);
router.patch('/:id' , checkUser , uploadFiles , routes.editPost); 
router.delete('/:id' , checkUser , routes.deletePost);



export default router;


/**
 * @swagger
 * /post:
 *   post:
 *     summary: create post
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/CreatePost'
 *           encoding:
 *             $ref: '#/components/encoding'
 *     responses:
 *       201:
 *         description: Post created successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Internal server error
 * 
 * components:
 *  schemas:
 *    CreatePost:
 *      type: object
 *      properties:
 *        content:
 *          type: string
 *          minLength: 1
 *          maxLength: 1200
 *        isCommunityPost:
 *          type: boolean
 *          default: false
 *        hashtags:
 *          type: array
 *          items: 
 *            type: string
 *          example: ["fun", "travel", "coding"]
 *        mentions:
 *          type: array
 *          items: 
 *            type: string
 *        media:
 *          type: array
 *          items:
 *            type: string
 *            format: binary
 *        videoIds:
 *          type: array
 *          items: 
 *            type: string   
 *        title:
 *          type: string
 *          description: "Required only if isCommunityPost is true"
 *        community:
 *          type: string
 *          description: "Required only if isCommunityPost is true"
 *        category:
 *          type: string
 *          enum: ['general', 'question', 'feedback', 'showcase']
 *          description: "Required only if isCommunityPost is true"
 *        isAnonymous:
 *          type: boolean
 *          default: false
 *          description: "Required only if isCommunityPost is true"
 *        scheduledAt:
 *          type: string
 *          format: date-time
 *      required:
 *        - content 
 *
 * 
 *  encoding:
 *    hashtags:
 *      explode: true
 *    mentions:
 *      explode: true
 *    videoIds:
 *      explode: true
 *    category:
 *      explode: true
 *        
 */

/**
 * @swagger
 * /post/user:
 *   get:
 *     summary: get user posts
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tab
 *         required: true
 *         schema:
 *           type: string
 *           enum: ['Posts', 'Replies', 'Likes', 'History', 'BookMarks', 'Media']
 *         description: Tab name to filter posts
 *       - in: query
 *         name: page
 *         required: true
 *         schema:
 *           type: number
 *         description: Page number
 *       - in: query
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Username of the author whose posts to fetch
 * 
 *     responses:
 *       200:
 *         description: fetched user posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500: 
 *         description: Internal server error
 */

/**
 * @swagger
 * /post/toggle/{id}:
 *   post:
 *     summary: toggles bookmarks, likes and pins on post  
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
 *               option:
 *                 type: string
 *                 enum: ['bookmark', 'like', 'pin']
 *     responses:
 *       200:
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
 *                     operation:
 *                       type: boolean
 *         description: Operation performed successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         description: Internal server error
 * 
 */

/**
 * @swagger
 * /post/increaseViews/{id}:
 *   post:
 *     summary: increase post views 
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
 *         description: Post views increased successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /post/trending:
 *   get:
 *     summary: fetch trending posts
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: true
 *         schema:
 *           type: number
 *         description: Page number
 *       - in: query
 *         name: tab
 *         required: true
 *         schema:
 *           type: string
 *           enum: ['Trending', 'Media', 'Communities', 'People']
 *         description: Tab name to filter posts
 *     responses:
 *       200:
 *         description: fetched trending posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500: 
 *         description: Internal server error
 */

/**
 * @swagger
 * /post/me/feed:
 *   get:
 *     summary: fetch feed posts
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: true
 *         schema:
 *           type: number
 *         description: Page number
 *       - in: query
 *         name: tab
 *         required: true
 *         schema:
 *           type: string
 *           enum: ['For You', 'Following', 'Media', 'Communities']
 *         description: Tab name to filter posts
 *     responses:
 *       200:
 *         description: fetched feed posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500: 
 *         description: Internal server error
 */

/**
 * @swagger
 * /post/{id}:
 *   get:
 *     summary: get post by id
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
 *         description: fetched post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500: 
 *         description: Internal server error
 */

/**
 * @swagger
 * /post/{id}/:
 *   delete:
 *     summary: delete post
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
 *         description: Post deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500: 
 *         description: Internal server error
 */
