import express from 'express'
import { searchBarSearch, searchUsers , normalSearch, continueSearch } from '../controllers/search/search.controller.js'
import {checkUser} from '../utils/chekAuth.js'

const router = express.Router()

/**query
 * @swagger
 * /search/searchbar:
 *   post:
 *     summary: autocomplete suggestions search for search bar
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 * 
 *     responses:
 *       200:
 *         description: Search results
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
 *                     autocomplete:
 *                       type: object
 *                       properties:
 *                         communities:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                         users:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /search/n:
 *   post:
 *     summary: Search across users, posts, communities
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/searchResultUser'
 *                 posts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/searchResultsPosts'
 *                 communities:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/searchResultsCommunities'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /search/continue:
 *   post:
 *     summary: Continue search
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *               - page
 *               - tab
 *             properties:
 *               query:
 *                 type: string
 *               page:
 *                 type: integer
 *               tab:
 *                 type: string
 *                 enum: [post, user, community]
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     results:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/searchResultUser'
 *                     total:
 *                       type: integer
 *                 post:
 *                   type: object
 *                   properties:
 *                     results:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/searchResultsPosts'
 *                     total:
 *                       type: integer
 *                 community:
 *                   type: object
 *                   properties:
 *                     results:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/searchResultsCommunities'
 *                     total:
 *                       type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /search/searchUsers:
 *   post:
 *     summary: Search users
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *               page:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/searchResultUser'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         description: Internal server error
 */

router.post('/searchbar' ,checkUser , searchBarSearch) ;
router.post('/n', checkUser , normalSearch) ;

router.post('/continue' , checkUser , continueSearch)

router.get('/searchUsers' , checkUser , searchUsers)

export default router ;