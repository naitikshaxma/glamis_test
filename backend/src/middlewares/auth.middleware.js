import { User } from "../models/users.models.js";
import { isEmpty } from "../utils/isEmptyFields.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

const isAuthenticated = asyncHandler(async(req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        if(isEmpty(token)){
            return res.status(401).json(ApiError(401,"Unauthorized request"))
        }
    
        const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            return res.status(401).json(ApiError(401, "User Doesn't Exist"))
        }
    
        req.user = user
        console.log("User is authenticated")
        next()
    } catch (error) {
        return res.status(500).json(ApiError(500, error?.message || "Internal Server Error in authMidlleware"))
    }
})

export default isAuthenticated;
