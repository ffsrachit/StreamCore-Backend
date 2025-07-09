import { asyncHandler } from "../utils/asyncHandler.js"; // wrapper isse hrr chiz ko try catch vagrha mein nhi dalna padgea
import {ApiError} from "../utils/APiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary}  from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiRespnse.js";

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

if (!username || !email) {
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
  secure : Only
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
  secure : Only
}

return res.status(200).clearCookie("accessToken", options)
.clearCookie("refreshToken" , options)
.clearCookie("accessToken" , options)
.json(new ApiResponse(200 , {} , "User logged out"))
})

export {registerUser ,loginUser , logoutUser}