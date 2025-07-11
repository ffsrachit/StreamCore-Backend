import { asyncHandler } from "../utils/asyncHandler.js"; 
import { ApiResponse } from "../utils/ApiRespnse.js";

const healthcheck = asyncHandler(async(req , res)=>{
 return res.status(200)
 .json(new ApiResponse(200 , {} , "Everything is okay"))
})

export  {healthcheck}