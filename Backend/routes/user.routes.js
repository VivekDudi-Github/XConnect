import express from "express";
import { checkUser } from "../utils/chekAuth.js";
import { getMe, loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";


const router = express.Router();

router.get('/check-health', checkUser , (req , res) => {
    res.status(200).json({
        success: true,
        message: "Server is healthy"
    });
})

router.post('/signup' , registerUser)
router.get('/logout' , logoutUser)
router.post('/login' , loginUser)

router.get('/me', checkUser, getMe);



export default router;