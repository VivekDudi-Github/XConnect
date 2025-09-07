import { User } from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import cookie from 'cookie'

const cookieOptions = {
    secure : true ,
    httpOnly : true  ,
    sameSite : true
}

// checks for token in cookies and verifies it
const checkUser = (req, res , next) => {
    try {
        let token = req.cookies.accessToken ;
        if(token){
            return jwt.verify(token , process.env.ACCESS_TOKEN_SECRET , (err , decoded) => {
                if(err){
                    console.log(err , 'line 15');
                    checkRefreshToken() ;
                }else {
                    req.user = decoded;
                    return next();
                }
            });
        }
        
        return checkRefreshToken() ;

        function checkRefreshToken() {
            token = req.cookies.refreshToken;
            try {
                if(token){
                    return jwt.verify(token , process.env.REFRESH_TOKEN_SECRET , async (err , decoded) => {
                        if(err){
                            console.log('error in verifying refresh token' , err);
    
                            return res.status(401).json({
                                success : false ,
                                message : "Unauthenticated request , please relogin."
                            });
                        } else{
                            const user = await User.findById(decoded._id).select("username _id avatar role");
                            const accessToken = user.generateAccessToken();
                            const refreshToken = user.generateRefreshToken();
                            user.refreshToken = refreshToken;
                            await user.save() ;
    
                            req.user = user;
                            res
                            .cookie('refreshToken', refreshToken, {...cookieOptions , maxAge: 30 * 24 * 60 * 60 * 1000})
                            .cookie('accessToken', accessToken, {...cookieOptions , maxAge: 30 * 60 * 1000});
                            return next();
                        }
                })
                } else {
                    return res.status(401).json({
                        success: false,
                        message: "You are not authenticated"
                    });
                }
            } catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "We cannot verify you at moment , please re-login",
                })
            }
    }
} catch (error) {
    console.log("error while checking user", error);
    return res.status(500).json({
        success: false,
        message: "We cannot verify you at moment , please re-login"
    });
}
}

const checkSocketUser = (socket , next) => {
    const token = cookie.parse(socket.request.headers.cookie || '') ;

    if(!token.accessToken){
      return next(new Error('No token provided'));
    }

    jwt.verify(token.accessToken , process.env.ACCESS_TOKEN_SECRET , (err , decoded) => {
      if(err){
        return next(new Error('Invalid token'));
      }
      socket.user = decoded;
      next();
    })
}

export {checkUser , checkSocketUser}
