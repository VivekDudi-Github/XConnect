import { User } from "../models/user.model.js";
import { Notification } from "../models/notifiaction.model.js";
import bcrypt from "bcryptjs";
import { TryCatch , ResError , ResSuccess } from "../utils/extra.js";
import { uploadFilesTOCloudinary } from "../utils/cloudinary.js";
import { Following } from "../models/following.model.js";
import { emitEvent } from "../utils/socket.js";
import { Types } from "mongoose";

const ObjectId = Types.ObjectId;

//update banner & dp left
const cookieOptions = {
    secure : true ,
    httpOnly : true  ,
    sameSite : true
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
    // const user = await User.findById(userId).select("-password -refreshToken");

    const user = await User.aggregate([
        {$match : {
            _id : new ObjectId(`${userId}`) ,
        }} ,
        {$project : {
            refreshToken : 0 ,
            password : 0 ,
        }} ,
        {$lookup : {
            from : 'following' ,
            let : { userId : '$_id'} ,
            pipeline : [
                {$match : {
                    $expr : {
                        $eq : ['$followedTo' , '$$userId']
                    }
                }} ,
                {$project : {
                    followedTo : 0 ,
                    followedBy : 0 ,
                }}
            ] ,
            as : 'followers' ,
        }} ,
        {$lookup : {
            from : 'following' ,
            let : { userId : '$_id'} ,
            pipeline : [
                {$match : {
                    $expr : {
                        $eq : ['$followedBy' , '$$userId']
                    }
                }} ,
                {$project : {
                    followedTo : 0 ,
                    followedBy : 0 ,
                }}
            ] ,
            as : 'following' ,
        }} ,
        {$lookup : {
            from : 'posts' ,
            let : { userId : '$_id'} ,
            pipeline : [
                {$match : {
                    $expr : {
                        $eq : ['$author' , '$$userId'] ,
                        $eq : ['$isDeleted' , false] ,
                    }
                }} ,
                {$project : {
                    content : 0 ,
                    author : 0 ,
                    createdAt : 0 ,
                    isEdited : 0 ,
                }}
            ] ,
            as : 'posts' ,
        }} ,
        {$addFields : {
            followers : {$size : '$followers'} ,
            following : {$size : '$following'} ,
            posts : {$size : '$posts'} ,
        }}  
        
    ]) ;
    
    if (!user) {
        return ResError(res, 404, "User not found");
    }
    
    return ResSuccess(res, 200, user[0]);
} , 'GetMe')

const updateUser = TryCatch( async(req , res) => {
    const {username , bio , fullname ,location , hobby } = req.body ;
    const {banner , avatar} = req.files ;


    if(!username && !bio && !fullname && !location && !hobby && !banner && !avatar) return ResError(res , 400 , 'Atleast provide a field to be changed')

    if ( username && (username.length < 3 || username.length > 20)) return ResError(res , 400 , "Username must be between 3 and 20 characters long") ;
    if (username && !/^[a-zA-Z0-9_@]+$/.test(username)) return ResError(res, 400, "Username can only contain letters, numbers, and underscores"); 
    
    const existingUser = await User.findOne({username : username}) 

    if(!existingUser._id.equals( req.user._id)) return ResError(res , 400 , 'Username already used')

    let avatarResults ;
    if(avatar) {
        avatarResults = await uploadFilesTOCloudinary(avatar) ;
    }
 
    let bannerResults  ;
    if(banner) {
        bannerResults =  await uploadFilesTOCloudinary(banner) ;
    }

        
    const {_id} = req.user ;

    const user = await User.findByIdAndUpdate(_id, {
        username,
        bio,
        fullname ,
        location ,
        avatar : avatarResults ? avatarResults[0] : undefined ,
        banner : bannerResults ? bannerResults[0] : undefined ,
        hobby ,
    }, { new : true , omitUndefined : true , runValidators: true  }).select("-password -refreshToken");
    
    if(avatarResults){
        const accessToken = user.generateAccessToken();
        res.cookie('accessToken', accessToken, {...cookieOptions , maxAge: 30 * 60 * 1000});
    }
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

const getAnotherUser = TryCatch(async(req , res) => { 
    const {username} = req.params ;
    
    if(!username) return ResError(res , 400 , 'User username is required')

    const user = await User.aggregate([
        {$match : {
            username : username ,
        }} ,
        {$project : {
            refreshToken : 0 ,
            password : 0 ,
        }} ,
        {$lookup : {
            from : 'following' ,
            let : { userId : '$_id'} ,
            pipeline : [
                {$match : {
                    $expr : {
                        $eq : ['$followedTo' , '$$userId']
                    }
                }} ,
                {$project : {
                    followedTo : 0 ,
                    followedBy : 0 ,
                }}
            ] ,
            as : 'followers' ,
        }} ,
        {$lookup : {
            from : 'following' ,
            let : { userId : '$_id'} ,
            pipeline : [
                {$match : {
                    $expr : {
                        $eq : ['$followedBy' , '$$userId']
                    }
                }} ,
                {$project : {
                    followedTo : 0 ,
                    followedBy : 0 ,
                }}
            ] ,
            as : 'following' ,
        }} ,
        {$lookup : {
            from : 'posts' ,
            let : { userId : '$_id'} ,
            pipeline : [
                {$match : {
                    $expr : {
                        $eq : ['$author' , '$$userId'] ,
                        $eq : ['$isDeleted' , false] ,
                    }
                }} ,
                {$project : {
                    content : 0 ,
                    author : 0 ,
                    createdAt : 0 ,
                    isEdited : 0 ,
                }}
            ] ,
            as : 'posts' ,
        }} ,
        {$addFields : {
            followers : {$size : '$followers'} ,
            following : {$size : '$following'} ,
            posts : {$size : '$posts'} ,
        }}  
        
    ])
    
    if(!user) return ResError(res , 404 , 'User not found')

    const isFollowing = await Following.exists({followedTo : user[0]._id , followedBy : req.user._id})

    return ResSuccess(res , 200 , {...user[0] , isFollowing : isFollowing ? true : false })   
} ,'getAnotherUser')

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


const togglefollow  = TryCatch(async(req , res) => {
    const {id} = req.params ;
    
    if(!id) return ResError(res , 400 , 'User id is required')
    
    const isExistFollowing = await Following.exists({followedTo : id , followedBy : req.user._id})
    
    if(isExistFollowing){
        await Following.findOneAndDelete({followedTo : id , followedBy : req.user._id})
        
        const notify = await Notification.findOneAndDelete({
            type : 'follow' ,
            sender : req.user._id ,
            receiver : id ,
        })
        
        emitEvent('notification:retract' , `user` , [`${id}`] , {
            type : 'follow' ,
            _id : notify._id.toString() ,
        })
    } else {
        await Following.create({
            followedTo : id ,
            followedBy : req.user._id ,
        })
        const notify = await Notification.create({
            type : 'follow' ,
            sender : req.user._id ,
            receiver : id ,
            isRead : false ,
        })
        
        emitEvent('notification:receive' , `user` , [`${id}`] , {
            type : 'follow' ,
            _id : notify._id.toString() ,
            sender : {
                _id : req.user._id.toString() ,
                avatar : req.user.avatar ,
                username : req.user.username ,
            },
            receiver : id.toString() ,
            isRead : false ,
        })
    }

    return ResSuccess(res , 200 , {operation : isExistFollowing ? false : true })
} , 'Toggle follow')

const getMyNotifications = TryCatch(async(req , res) => {
    const notifications = await Notification.find({receiver : req.user._id}).populate('sender' , 'avatar fullname username') ;
    console.log(notifications);
    
    return ResSuccess(res , 200 , notifications) ;
} , 'get notification' )

const changeMYNotificationStatus = TryCatch(async(req , res) => {
    const {notificationId = []} = req.body ;
    const notification = await Notification.findById(notificationId) ;
    console.log(notificationId);
    
    if(notificationId.length === 0 || !notification) return ResError(res , 400 , 'Notification id is required')
    
    if(!notification.receiver.equals(req.user._id)) return ResError(res , 400 , 'You are not the receiver of this notification')

    const ops = notificationId.map(id => ({
        updateOne : {
            filter : {_id : id} ,
            update : {
                $set : {
                    isRead : true ,
                }
            }
        }
    }))

    await Notification.bulkWrite(ops , { ordered : false})
    
    return ResSuccess(res , 200 , 'Notification status changed') ;
} , 'changeMYNotificationStatus')


export {
    registerUser ,
    loginUser ,
    logoutUser ,
    getMe ,
    updateUser ,
    deleteUser ,
    getAnotherUser ,
    changePassword ,
    togglefollow ,

    getMyNotifications ,
    changeMYNotificationStatus
}