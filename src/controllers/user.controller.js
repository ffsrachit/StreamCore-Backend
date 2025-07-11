import { asyncHandler } from "../utils/asyncHandler.js"; // wrapper isse hrr chiz ko try catch vagrha mein nhi dalna padgea
import {ApiError} from "../utils/APiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary}  from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiRespnse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";


const generateAccessAndRefreshTokens = async(userId) =>{
  try {
    const user =await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken =refreshToken
    await user.save({validateBeforeSave : false})

    return {accessToken, refreshToken}

  } catch (error) {
    throw new ApiError(500 , " Something went wrong while generating refresh and access token ")
  }
}

const registerUser = asyncHandler(async(req , res) =>{

  
   // get user details from frontend
   //validation-not empty
   //check if user is already exists : username , email
   // check for images 
   //check for avtar
   //upload to cloudinary ,avtar
   // create user object - create entry in db
   // remove password and refresh token field from response
   // check for user creation
   // return response 


   // getting details
    const {fullName , email , username , password} = req.body


   // console.log(req.body)
    // console.log("email :" , email);

  //  if(fullName === ""){
   //     throw new ApiError(400 , "fullName is required")  // ya toh aise kro hrr field ko nhi toh
   // }
  
// validation

   if(
    [fullName , email , username , password].some((field)=> 
    field?.trim() === "")
   ){
    throw new ApiError(400 , "All field are required")
   }


// check if user already existed

   const existedUser =   await User.findOne({
        $or :[{email} , {username}]
    })

    if(existedUser){
        throw new ApiError(409 , "User already existed")
    }

//console.log(req.files)
    // check for images 
   //check for avatar
     const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath =req.files?.coverImage[0]?.path;


    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) &&req.files.coverImage >0) {
      coverImageLocalPath = req.files.coverImage[0].path                                      // advanced method to check for coverimage
    }



      

if(!avatarLocalPath){
    throw new ApiError(400 , "Avatar file is required ")
}


//upload on cloudinary

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if(!avatar){
    throw new ApiError(400 , "Avatar file is required ")
  }

    const user = await User.create({
    fullName, 
    avatar: avatar.url, 
    coverImage: coverImage?.url || "",
    email , password, 
    username : username.toLowerCase()
  })

   //console.log(user)

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if(!createdUser){
    throw new ApiError(500 , 'Something went wrong while registering the user')
  }


  return res.status(201).json(
    new ApiResponse(200, createdUser , "User registered Successfully")
  )


})

const loginUser = asyncHandler(async(req , res)=>{
// req body -> data
// username or email 
//find the user
//password check
//access and refresh token generate and send user
// send cookies
//response success 



// req body -> data


const {email , username , password} = req.body

if (!(username || email)) {
  throw new ApiError(400 , "Username or password is required")
}
// find user
  const user = await User.findOne({
  $or :[{email} , {username}]
})

if(!user){
  throw new ApiError(404 , "User does not exist")
}


// password checking 
const isPasswordValid = await user.isPasswordCorrect(password)

if(!isPasswordValid){
  throw new ApiError(401 , " Invalid user credentials")
}

 // generate access and refresh token
const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)


const loggedInUser = await User.findById(user._id).select("-password -refreshToken")



//cookies

const options ={
  httpOnly :true,
  secure : true
}

return res.status(200)
.cookie("accessToken" , accessToken , options)                // piece of data store in user computer
.cookie("refreshToken" , refreshToken , options)
.json(
  new ApiResponse(200 , {
    user : loggedInUser , accessToken , refreshToken              // yha pe user khud se access aur refresh token save krna chahra hbo
  } , "User Logged  in Successfully")
)

})


const logoutUser = asyncHandler(async(req , res)=>{
   await User.findByIdAndUpdate(
    req.user_id ,{
      $set : {
        refreshToken :undefined
      }
    }, {
      new : true
    }
  ) 
  const options ={
  httpOnly :true,
  secure : true
}

return res.status(200).clearCookie("accessToken", options)
.clearCookie("refreshToken" , options)
.clearCookie("accessToken" , options)
.json(new ApiResponse(200 , {} , "User logged out"))
})

const refreshAccessToken = asyncHandler(async(req, res)=>{

  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if(!incomingRefreshToken){
    throw new ApiError(401 , "Unauthorized request")
  }

 try {
   const decodedToken = jwt.verify(incomingRefreshToken , process.env.REFRESH_TOKEN_SECRET)
 
 
   const user = await User.findById(decodedToken?._id)
 
   if(!user){
     throw new ApiError(401 , " Invalid refresh Token")
   }
 
 
   if(incomingRefreshToken !== user?.refreshToken){
     throw new ApiError(401 , "Refresh Token is Expired or used")
   }
 
   const options = {
     httpOnly : true, 
     secure : true
   }
 
   const {accessToken , newrefreshToken} = await generateAccessAndRefreshTokens(user_id)
 
   return res.status(200)
   .cookie("accessToken" , accessToken , options)
   .cookie("refreshToken" , newrefreshToken , options)
   .json(
     new ApiResponse(
       200 , {accessToken , refreshToken : newrefreshToken } , "access Token refreshed"
     )
   )
 } catch (error) {
  throw new ApiError(401 , error?.message || "Invalid refresh Token"
  )
 }
})

const changeCurrentPaaword = asyncHandler(async(req , res) =>{
  const {oldPassword , newPassword , confirmPassword} = req.body

// check new password 
  if( !(newPassword === confirmPassword)){
    throw new ApiError(401 , "password must be same")
  }


  // get user access by id to check password
   const user = await User.findById(req.user?._id)

 // check password is correct
   const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)


   if(!isPasswordCorrect){
    throw new ApiError(400, "Password is Incorrect")
   }

   // changes made 

   user.password = newPassword
   await user.save({validateBeforeSave : false})

   return res
   .status(200)
   .json(new ApiResponse(200 , {} , "Password changed successfully"))
})

const getCurrentUser = asyncHandler(async(req , res) =>{
  // fetching current user 
  const currentUser = req.user
   return res.status(200)
   .json(200 , currentUser, "current user fetch successfully")
})

const updateAccountCredentials = asyncHandler(async(req , res) =>{
const { fullName , email} = req.body

if(!(username || fullName || email)){
  throw new ApiError(400 , " All field are required")
}

 const user = await User.findByIdAndUpdate(
  req.user?._id ,
  {
    $set : {
      fullName , 
      email : email
    }
  },
  {new : true}                       // agar new true bhejte hai toh update hone k baad jon info hoti hai vo bhi return hoti hai 
).select("-password ")

return res
.status(200)
.json(new ApiResponse (200 , user , "Account Credentials Updated Successfully"))
})

const updateUserAvatar = asyncHandler(async(req , res) =>{
  // ye nya avtar upload kra hai
const avatarLocalPath = req.file?.path

if(!avatarLocalPath){
  throw new ApiError(400 , "Avatar file is missing")
}
// upload on cloudinary to get the url

const avatar = await uploadOnCloudinary(avatarLocalPath)

if(!avatar.url){
  throw new ApiError(400, "  Avatar Url missing ")
}


// NOw Update 


const user = await User.findByIdAndUpdate(
  req.user?._id , 
  {
    $set : {
      avatar : avatar.url
    }

  },
  {new : true}
).select("-password")


return res
.status(200)
.json(new ApiResponse(200 , user , "Avatar Updated Successfully" ))
})

const updateCoverImage = asyncHandler(async(req , res) =>{
 const coverImageLocalPath = req.file?.path

 // upload on cloudinary 

if(!coverImageLocalPath){
  throw new  ApiError(400 , "coverImage file is missing")
}
 const coverImage = uploadOnCloudinary(coverImageLocalPath)

 if(!coverImage.url){
  throw new ApiError(401 , "coverImage url is missing")
 }

//  now update to new


  const user = await User.findByIdAndUpdate(
    req.user?._id  , 
    {
      $set : {coverImage  : coverImage.url}
    } , 
    {new : true }
  )

  return res
  .status(200)
  .json(new ApiResponse(200 , user , "coverImage Updated Successfully" ))
}) 

const getUserChannelProfile = asyncHandler(async(req , res) =>{
 const {username} =  req.params

 if(!username?.trime()){
  throw new ApiError(400 , "usernmae is missing")
 }

  const channel = await User.aggregate([{
    $match :{
      username :username?.toLowerCase()
    }
  }
   ,{
    $lookup : {
      from : "Subscription",
      localField : "_id",
      foreignField : "channel",
      as : "subscribers"
    }
  },
    {
      $lookup :{
        from : "Subscription",
        localField : "_id",
        foreignField : "subscriber",
        as : "subscribedTo"
      }
    } , 

    {
      $addFields : {
        subscriberCount : {
          $size : "$subscribers"
        } , 
        
          channelSubscribedTo : {
            $size : "$subscribedTo"
          } , 
          iSubscribed : {
            $cond : {
              if : {$in : [req.user?.id , "$subscribers.subscriber"]},
              then : true , 
              else : false
            }
          }
        
      }
    },
    {
      $project :
      {
        fullName : 1 ,
        username : 1 ,
        subscriberCount : 1,
        channelSubscribedTo : 1,
        iSubscribed : 1 , 
        coverImage :1 , 
        avatar : 1 , 
        email : 1
      }
    }

  
  ])
  if(!channel?.length){
    throw new ApiError(404 , "channel does not exist")
  }

  return res.status(200)
  .json(new ApiResponse(200 , channel[0] , "User channel fetched Successfully"))
})

const getWatchHistory = asyncHandler(async(req , res)=>{
  const user = await User.aggregate([{
    $match : {
      _id : new mongoose.Types.ObjectId(req.user._id)
    }
  },
     {
      $lookup : {
        from : "videos",
        localField : "watchHistory" , 
        foreignField : "_id",
        as : "watchHistory" , 
        pipeline :[
          {
            $lookup:{
              from : "users",
              localField : "owner",
              foreignField : "_id" ,
              as : "owner" , 
              pipeline : [
                {
                  $project : {
                    fullName : 1 , 
                    username :1 , 
                    avatar : 1
                  }
                }
              ]
            }
          }
        ]
      }
     },{
      $addFields : {
        owner : {
          $first : "$owner"
        }
      }
     }
  ])

  return res.status(200)
  .json(new ApiResponse(200 , user[0].watchHistory , " Watch History fetched Successfully"))
})




export {registerUser ,
   loginUser ,
   logoutUser ,
   refreshAccessToken ,
   changeCurrentPaaword ,
   getCurrentUser ,
   updateAccountCredentials ,
   updateUserAvatar , 
   updateCoverImage , 
   getUserChannelProfile , 
   getWatchHistory
   
}