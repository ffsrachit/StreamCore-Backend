import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/APiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js"
import {Like} from "../models/like.model.js"
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";
import mongoose from "mongoose";


const toggleVideoLike = asyncHandler(async(req , res) =>{
    const {videoId} = req.params;

    if(!videoId){
        throw new ApiError(404 , "VideoId is missing")
    }
    const existingVideo = await Video.findById(videoId)

    if(!existingVideo){
        throw new ApiError(  400 ,"Video not exist")
    }
const like = await Like.findOne({likedby : req.user?._id , video : videoId})
let likedstatus;
if(!like){
    await Like.create({
        likedby : req.user?._id ,
        video : videoId
    })
likedstatus = 'Liked'
}else {
    await like.deleteOne();
    likedstatus = 'Unliked'
}

return res.status(200)
.json(new ApiResponse(200 , {status : likedstatus}  ,`Video has been ${likedstatus.toLowerCase()} Successfully`))
})

const toggleCommentLike = asyncHandler(async(req , res)=>{
    const {commentId} = req.params;

    if(!commentId){
        throw new ApiError(402 , "commentId is missing")
    }
    const existingComment = await Comment.findById(commentId)

    if(!existingComment){
        throw new ApiError(401 , "Comment not found with this commentId")
    }

  const like = await Like.findOne({likedby : req.user?._id , comment : commentId})
  let likedStatus;
  if(!like){
    await Like.create({
        likedby : req.user?._id ,
        comment : commentId
    })
    likedStatus = "Liked"
  }else {
    await like.deleteOne();
    likedStatus = "Unliked"
  }

  return res.status(200)
  .json(new ApiResponse(200 , {status : likedStatus} , `Comment is ${likedStatus} successfully`))
})

const toggleTweetLike = asyncHandler(async(req , res)=>{
const {tweetId} = req.params;

if(!tweetId){
    throw new ApiError(400 , "TweetId is missing")
}

const existingtweet = await Tweet.findById(tweetId)

if(!existingtweet){
    throw new ApiError (401 , "No tweet has been found with this Id ")
}

const like = await Like.findOne({likedby : req.user?._id   , tweet : tweetId})
let likedStatus;
if(!like){
    Like.create({
        likedby : req.user?._id ,
        tweet : tweetId
    })
    likedStatus = "Liked"
}else {
     await like.deleteOne()
    likedStatus = "Unliked"
}

return res.status(200)
.json(new ApiResponse(200 , {status : likedStatus.toLowerCase()} , `Tweet has been ${likedStatus} successfully`))
})

const getLikeVideosDetails = asyncHandler(async(req , res)=>{

    const likedVideos = await Like.aggregate([{
        $match :
        {
            likedby : new mongoose.Schema.Types.ObjectId(req.user?._id) , video : {
                $exists : true , $ne : null
            }
        } ,
    } , {
        $lookup :{
            from : "videos",
            localField : "video",
            foreignField : "_id" ,
            as : "VideoDetails"
        }
    } , {
        $unwind : {
            path : "$VideoDetails" , 
            preserveNullAndEmptyArrays : true
        }
    } , {
        $lookup :{
            from  :"users" , 
            localField : "VideoDetails.owner",
            foreignField :"_id" , 
            as : "ownerinfo" , 
            pipeline : [{
                $project : {
                    username : 1 , 
                    fullName : 1 , 
                    avatar : 1
                }
            }]
        }
    }, 

    {
        $unwind : {
            path : "$ownerinfo",
            preserveNullAndEmptyArrays : true 
        }
    } , {
        $addFields : {
            "VideooDetails.owner" : "$ownerinfo"
        }
    } , {
        $replaceRoot : {
            newRoot : "VideoDetails"
        }
    }
])

return res.status(200)
.json(new ApiResponse(200 , {LikedVideos : likedVideos} , "Liked Videos has been fetched successfully" ))
})

export {
    getLikeVideosDetails , 
    toggleTweetLike , 
    toggleCommentLike , 
     toggleVideoLike 
    
}