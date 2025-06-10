import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";

//update banner & dp left
const cookieOptions = {
    secure : true ,
    httpOnly : true  ,
    sameSite : true
}

const ResError = (res , statusCode , message) => {
    return res.status(statusCode).json({
        success : false ,
        message
    })
}
const ResSuccess = (res ,statusCode , data) => {
    res.status(statusCode).json({
        success: true,
        data: data
    })
} 

const TryCatch = (func , funcName) => {
    return async function (req, res, next) {
        try {
            await func(req, res, next);
        } catch (error) {
            console.log(`Error in ${funcName}:`, error);
            return ResError(res, 500, `Internal Server Error`);
        }
    }
}

const generateTokens =async (user) => {
    try {
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken
        await user.save()

        return { accessToken, refreshToken };
    } catch (error) {
        console.log(error);
        
        throw new Error('Error while creating the tokens')   
    }
}

const registerUser = TryCatch(async(req , res) => {
    const { username, password, email ,fullname } = req.body;
    
    if (!username || !password || !email || !fullname) {
        return ResError(res, 400, "All fields are required");
    }

    if (username.length < 3 || username.length > 20) return ResError(res , 400 , "Username must be between 3 and 20 characters long");
    if (!/^[a-zA-Z0-9_@]+$/.test(username)) return ResError(res, 400, "Username can only contain letters, numbers, and underscores");
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) return ResError(res, 400, "Invalid email format");


    if(password.length < 8) return ResError(res, 400, "Password must be at least 8 characters long");
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return ResError(res, 400, "Email already exists");

    const existingUsername = await User.findOne({username})
    if(existingUsername) return ResError( res , 400 , "Username is not available")


    const salt = await bcrypt.genSalt(15) ;
    const hashedPassword = await bcrypt.hash(password ,salt)

    const user = new User({ username, password : hashedPassword, email , fullname});
    await user.save();

    return ResSuccess(res , 201 , {
        username : user.username,
        email : user.email,
    } )   
} , 'registerUser')

const loginUser = TryCatch(async(req , res) => {
    const {email , password , username} = req.body;

    if(!email && !username) return ResError(res , 400 , "Email or Username is required")
        
    if(!password) return ResError(res , 400 , "Password is required")

    const user = await User.findOne({
        $or : [
            {email : email} ,
            {username : username}
        ]
    })
    if(!user) return ResError(res , 400 , "Invalid credentials")
        
        const isPasswordCorrect = await user.IsPasswordCorrect(password);
    if(!isPasswordCorrect) return ResError(res , 400 , "Invalid credentials")

    const { accessToken, refreshToken } = await generateTokens(user);
    if (!accessToken || !refreshToken) {
        return ResError(res, 500, "Error generating tokens");
    }
    
    const userObj = user.toObject();
    delete userObj.password; 
    delete userObj.refreshToken;

    return res
    .status(200)
    .cookie("refreshToken", refreshToken, {...cookieOptions , maxAge: 30 * 24 * 60 * 60 * 1000}) 
    .cookie("accessToken", accessToken, {...cookieOptions , maxAge: 30 * 60 * 1000})
    .json({
        success : true ,
        data : userObj
    })
} , "loginUser")

const logoutUser = TryCatch(async(req , res) => {
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')

    return ResSuccess(res , 200 , 'Logged Out Successfully')
} , 'LogoutUser')

const getMe = TryCatch(async (req ,res) => {
    const userId = req.user._id;
    const user = await User.findById(userId).select("-password -refreshToken");
    
    if (!user) {
        return ResError(res, 404, "User not found");
    }

    return ResSuccess(res, 200, user);
} , 'GetMe')

const updateUser = TryCatch( async(req , res) => {
    const {username , bio , fullname ,location , hobby } = req.body ;

    if(!username && !bio && !fullname && !location && !hobby) return ResError(res , 400 , 'Atleast provide a field to be changed')

    if ( username && (username.length < 3 || username.length > 20)) return ResError(res , 400 , "Username must be between 3 and 20 characters long") ;
    if (username && !/^[a-zA-Z0-9_@]+$/.test(username)) return ResError(res, 400, "Username can only contain letters, numbers, and underscores"); 
    
    const existingUser = await User.findOne({username : username}) 

    if(!existingUser._id.equals( req.user._id)) return ResError(res , 400 , 'Username already used')

    const {_id} = req.user ;

    const user = await User.findByIdAndUpdate(_id, {
        username,
        bio,
        fullname ,
        location ,
        hobby ,
    }, { new : true , omitUndefined : true , runValidators: true  }).select("-password -refreshToken");

    return ResSuccess(res , 200 , user)

} , 'updateProfile')

const deleteUser = TryCatch(async(req , res) => {
    const {password} = req.body ;

    if(!password) return ResError(res , 400 , 'Please provide the password' )

    const user = await User.findById(req.user._id)
    const passCheck = await user.IsPasswordCorrect(password)

    if(!passCheck) return ResError(res , 400 , 'Provided Password is incorrect')
    
    user.isDeleted  = true ;
    user.deletedAt = new Date() ;
    await user.save() ; 

    return ResError(res ,200 , "Accound removed Successfully")

} , 'deleteUser')

const getUserById = TryCatch(async(req , res) => {
    const {id} = req.params ;
    
    if(!id) return ResError(res , 400 , 'User id is required')

    const user = await User.findById(id).select("-password -refreshToken");

    if(!user) return ResError(res , 404 , 'User not found')

    return ResSuccess(res , 200 , user)
} ,'getUserById')

const changePassword = TryCatch(async(req , res) => {
    const {oldPassword , newPassword}  = req.body ;

    if(!oldPassword || !newPassword) return ResError(res , 400 , 'Password is required')
    if(oldPassword.trim() === newPassword.trim() ) return ResError(res , 400 , 'Both Passwords are same')
    if(newPassword.length < 8) return ResError(res , 400 , 'New Password must be at least 8 characters long')
    
    const user = await User.findById(req.user._id)
    const OldPassCheck = await user.IsPasswordCorrect(oldPassword);
    console.log( OldPassCheck);
    
    if(!OldPassCheck) return ResError(res , 400 , 'Password is incocrrect')
    
    const salt = await bcrypt.genSalt(15) ;
    const newPassHash = await bcrypt.hash(newPassword , salt) ;
    console.log(newPassHash);
    
    user.password = newPassHash ;
    await user.save() ;

    return ResSuccess(res , 200 , 'Password Changed')

} , 'changePassword')



export {
    registerUser ,
    loginUser ,
    logoutUser ,
    getMe ,
    updateUser ,
    deleteUser ,
    getUserById ,
    changePassword ,
}