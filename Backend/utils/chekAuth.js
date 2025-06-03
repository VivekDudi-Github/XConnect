import { User } from '../models/user.model.js';
import jwt from 'jsonwebtoken';

//checks for token in cookies and verifies it
const checkUser = (req, res , next) => {
    try {
        let token = req.cookies.accessToken ;
        if(token){
            jwt.verify(token , process.env.ACCESS_TOKEN_SECERET , (err , decoded) => {
                if(err){
                    token = null;
                }else {
                    req.user = decoded;
                    next();
                }
            });
        }

        if(!token){
            token = req.cookies.refreshToken ;
        }
        if(!token){
            return res.status(401).json({
                success : false ,
                message : "You are not authenticated"
            })
        }
        jwt.verify(token , process.env.REFESH_TOKEN_SECRET , async (err , decoded) => {
            if(err){
                return res.status(401).json({
                    success : false ,
                    message : "You are not authenticated"
                })
            }
            const user = await User.findById(decoded._id).select("username _id role") ;
            const accessToken = user.generateAccessToken() ;
            const refreshToken = user.generateRefreshToken() ;

            user.refreshToken = refreshToken ;
            await user.save() ;

            req.user = user ;
            res.cookies("refreshToken" , refreshToken)
            res.cookie("accessToken" , accessToken ,) 
            next() ;
        }
        );
    
    } catch (error) {
        return res.status(401).json({
            success : false ,
            message : "You are not authenticated"
        })
    }
}

export {checkUser} ;