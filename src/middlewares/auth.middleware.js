// ye verify krega ki user hai ya nhi hai 

import { ApiError } from "../utils/APiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async(req,resizeBy,next) =>{
  try {
     const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer" , "")
  
  
  
     if(!token){
      throw new ApiError(401, "Unauthorized request")
     }
  
  
    const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)
  
  
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
  
  
    if(!user){
      throw new ApiError(401 , " Invalid Access Token")
    }
  
    req.user = user;
    next()
  } catch (error) {
    throw new ApiError(401 , "Invalid Access Token")
  }
})