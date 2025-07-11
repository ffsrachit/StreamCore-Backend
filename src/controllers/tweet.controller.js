import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/APiError.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body;

    if(!(content || content.trim())){
        throw new ApiError(400 , "can not add a blank tweet")
    }
   const tweet = await Tweet.create({
        content : content.trim(),
        owner : req.user._id
    })

    return res.status(200)
    .json(new ApiResponse(200, {tweet} , "Tweet added Successfully"))
})

const getUserTweets = asyncHandler(async(req, res)=>{
    const {userId} = req.params
//yha  pe req.users bhi use kr skta tha .. pr req.params mujhe saare users ka tweets dega pr req .users sirf login users ka 
    if(!userId) {
        throw new ApiError(404 , "User not found")
    }

    // check user existing or not 

    const existingUser =  await Tweet.findById(userId)

    if(!existingUser){
        throw new ApiError(401 , " User doesnt Exist")
    }

    // tweets->users ke

    // combination of two document or collections

    const userTweets = await Tweet.aggregate([{
        $match : {
            owner : mongoose.Schema.Types.ObjectId(userId)   // sirf vhi tweets milenge jo userid se match krte honge
        }
    },
    {
        $sort : {createdAt : -1}
    },
    {
        $lookup : {
            from : "users",
            localField : "owner",
            foreignField : "_id" ,
            as : "ownerinfo" , pipeline :[
                {
                    $project :{
                        username :1 , 
                        fullName : 1, 
                        avatar :1
                    }
                }]
        }
    } , 
    {
        $unwind :{
            path : "$ownerinfo",
            preserveNullAndEmptyArrays :true
        }
    } , 
// ye frontend ki help k liye hai
    {
      $addFields : {
        username : "ownerinfo.username",
        fullName : "ownerinfo.username",
        avatar : "ownerinfo.username"
      }
    }, {
        $project : {
            content :1 , 
            fullName : 1, 
            avatar : 1 , 
            username : 1, 
    createdAt : 1, 
    updatedAt : 1
        }
    }
])

return res.status(200)
.json(new ApiResponse(200 , {tweets : userTweets} , "userTweets has been fetched successfully"))


})

const deleteTweet = asyncHandler(async(req , res)=>{

// find usertweet
    const {tweetId} = req.params;

    if(!tweetId){
        throw new ApiError(404 , " Tweet not found")
    }
// check user existence
    const existingTweet = await Tweet.findById(tweetId)

    if(!existingTweet){
        throw new ApiError (402 , " User doesnt Exist")
    }
// check for the owner
    if(!existingTweet.owner.equals(req.user._id)){
      throw new ApiError(403 , "Unauthorized Request")
    }

 await Tweet.findByIdAndDelete(tweetId);

 return res.status(200)
 .json(new ApiResponse(200 , {} , "Tweet Deleted Successfully"))
})

const UpdateTweet = asyncHandler(async(req , res)=>{
    const {tweetId} = req.params;
    if(!tweetId){
        throw new ApiError("Tweet not found")
    }

    const existingTweet = await Tweet.findById(tweetId)

    if(!existingTweet){
        throw new ApiError(402 , "Tweet doesnt exist")
    }

    if(!existingTweet.owner.equals(req.user._id)){
      throw new ApiError(403 , "Unauthorized Request")
    }
   const {content}  = req.body
   const updatedTweet =  await Tweet.findByIdAndUpdate(tweetId , {
        $set :{
          content : content?.toLowerCase()
        },
       
    }, 
     {new : true}

        
     )


     return res.status(200)
     .json(new ApiResponse(200, {updatedTweet} , "Tweet Updated Successfully"))
})

export {createTweet , UpdateTweet , deleteTweet , getUserTweets}