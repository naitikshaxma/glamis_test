const { asyncHandler } =  require("../utils/asyncHandler.js")
const { ApiError } = require("../utils/ApiError.js")
const { ApiResponse } =  require("../utils/ApiResponse.js")
const { User } =  require("../models/users.models.js")
const { isEmpty } = require("../utils/isEmptyFields.js")
const { createOtp } = require("../utils/helpers.js")
const jwt = require("jsonwebtoken")
const sendMail = require("../utils/sendMail.js")
const { connectRedis} = require("../db/redis.connect.js")




const generateAccessAndRefreshTokens = async (userId)=>{
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        user.save()

        return {
            accessToken, 
            refreshToken
        }
    } catch (error) {
        res.status(500).json(ApiError(500, error.message))
    }
}

const signup = asyncHandler(async (req, res)=>{
    const {name, email_id ,phone ,password ,confirm_password} = req.body;

    if(isEmpty(name) || isEmpty(email_id) || isEmpty(phone) || isEmpty(password) || isEmpty(confirm_password)){
        return res.status(401).json(ApiError(401, "All fields are required"))
    }

    if(password !== confirm_password){
        return res.status(401).json(ApiError(401, "Password do not match"))
    }

    const user = await User.findOne({$or : [{email_id}, {phone}]})

    if(user){
        return res.status(400).json(ApiError(400, "User already exists"))
    }

    const otp = createOtp();

    sendMail(email_id, "OTP Verification", `Your OTP is ${otp}`)

    

    // push otp to redis cache
    let redisClient;
    try{
        redisClient = await connectRedis()
        redisClient.set(email_id, otp);
        redisClient.expire(email_id, 600);
    }catch(error){
        console.log("Error while connecting to Redis", error)
    }   

    const userCreating = await User.create({
        name,
        email_id,
        phone,
        password
    })

    const createdUser = await User.findOne(userCreating._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        return res.status(500).json(ApiError(500, "Something might be up with the server"))
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "Account Created Successfully")
    )
})

const login = asyncHandler(async (req, res)=>{
    // todos : 

    /*

    1. get phone number and password - done
    2. check if phone number is validated or not and same with password - done
    3. if exists then validate password - done
    4. check if user exists or not, if yes geneate accesstoken and refresh token and send user in a cookies(Secure) - done

     */

    const { phone, password } = req.body;
    if(isEmpty(phone) || isEmpty(password)){
        return res.status(401).json(ApiError(401, "Please Fill All the fields"))
    }

    const isUser = await User.findOne({phone})

    console.log(isUser)

    if(isUser === null){
        return res.status(404).json(ApiError(404, "User Doesn't Exists"))
    }

    let isPasswordCorrectResponse = await isUser.isPasswordCorrect(password)
    if(!isPasswordCorrectResponse){
        return res.status(401).json(ApiError(401, "Password do not match"))
    }

    const { refreshToken, accessToken } = await generateAccessAndRefreshTokens(isUser._id)

    const loggedInUser = await User.findById(isUser._id).select("-password -refreshToken")

    const options = {
        httpOnly : true, // can only be modified by server not by client-side
        secure : true
    }

    return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200, {
            userData : loggedInUser,
            refreshToken,
            accessToken
        }, "LoggedIn Successfully")
    )
})


const logout = asyncHandler(async (req, res)=>{
    await User.findByIdAndUpdate(req.user._id, {
        $set : {
            refreshToken : undefined
        }
    },
    {
        new : true
    })

    const options = {
        httpOnly : true, // can only be modified by server not by client-side
        secure : true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, {}, "loggedOut Successfully")
    )
})

const refreshAccessToken = asyncHandler(async (req, res)=>{
    const { incomingRefreshToken } = req.cookies.refreshToken || req.header("Authorization")?.replace("Bearer ","")
    if(isEmpty(incomingRefreshToken)){
        return res.status(404).json(ApiError(404, "Unauthorized Request"))
    }

    try {
        const decodedRefreshToken = await jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        
        const user = await User.findById(decodedRefreshToken._id)
    
        if(!user){
            return res.status(404).json(ApiError(404, "Please send Valid Refresh Token"))
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            return res.status(404).json(ApiError(404, "Token May be Expired"))
        }
    
        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id)
    
        const options = {
            httpOnly : true,
            secure : true
        }
    
        return res
        .status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(200, {
                accessToken,
                refreshToken : newRefreshToken
            }, "Token Refreshed Successfully!")
        )
    } catch (error) {
        return res.status(500).json(ApiError(500, "Internal Server Error while Refreshing Access Token"))
    }
})

module.exports = { 
    signup,
    login,
    logout,
    refreshAccessToken
}