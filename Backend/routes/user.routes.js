import express from "express";
import { logoutUser, registerUser } from "../controllers/user.controller.js";

const router = express.Router();

router.get('/check-health', (req , res) => {
    res.status(200).json({
        success: true,
        message: "Server is healthy"
    });
})

router.post('/signup' , registerUser)
router.get('/logout' , logoutUser)



export default router;