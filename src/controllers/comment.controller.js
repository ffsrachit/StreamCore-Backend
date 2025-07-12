import mongoose, { mongo } from "mongoose";
import {Comment}  from "../models/comment.model.js"
import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/APiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";





const getVideoComments = asyncHandler(async(req , res) =>{


    const {videoId} = req.params;

    if(!videoId){
    throw new ApiError(404 , "Video is missing")
    }

    const existingVideo = await Video.findById(videoId)

    if(!existingVideo){
        throw new ApiError("Video not exist")
    }

    const{page =1 , limit =10} = req.query

    const options = {
        page : parseInt(page) ,
        limit : parseInt(limit)
    }

     const paginatedVideoComments = await Comment.aggregatePaginate(Comment.aggregate([{
          $match : {
            video :  new mongoose.Schema.Types.ObjectId(videoId)
          }

         },
         {
            $lookup : {
                from: "users",
                localField : "owner", 
                foreignField : "_id", 
                as : "CommentUser" , 
                pipeline : [
                    {
                        $project : {
                            username :1 , 
                            avatar : 1
                        }
                    }
                ]
            }
         } , 
         {
            $unwind : {
                path : "$CommentUser",
                preserveNullAndEmptyArrays : true
            }
         } , {
            $addFields : {
                username : "$CommentUser.username" , 
                avatar : "$CommentUser.avatar"
            }
         } , {

            $project : {
                content : 1 , 
                avatar : 1 ,
                username : 1 ,
                createdAt :1 , 
                updatedAt :1
            }
         }

         
          , {
            $sort : {createdAt : -1}
          }
        
        ]) , options)

return res.status(200).json(
    new ApiResponse(200 , {comments : paginatedVideoComments} , "Comments fetched Successfully"))
})

const addComments = asyncHandler(async(req , res)=>{
    const {content} = req.body
    const {videoId} = req.params

    if(!videoId){
        throw new ApiError(400 , "Video is missing")
    }

    const existingVideo = await Video.findById(videoId)

    if(!existingVideo){
        throw new ApiError(404 , "Video not exist")
    }
    if(!content.trim()){
        throw new ApiError(402 , "Content is required")
    }

   const newComment =  await Comment.create({
    content : content.trim() ,
    owner : req.user?._id , 
    video : videoId
   })

   return res.status(200)
   .json(new ApiResponse(200 , {comment : newComment} , "New Comment has been added successfully"))
})

const updateComment = asyncHandler(async(req , res)=>{
  const {commentId} = req.params

  if(!commentId){
    throw new ApiError(402 , "CommentId is missing")
  }

  const existingComment = await Comment.findById(commentId)
  
  if(!existingComment){
    throw new ApiError(403 , "Comment not found")
  }

  if(!existingComment.owner.equals(req.user?._id)){
    throw new ApiError(400 , "Unauthorized Request")
  }
const {content} = req.body
 const UpdatedComment =  await Comment.findByIdAndUpdate(commentId , {
    $set : {
        content : content?.toLowerCase()
    } 
  

} , {new : true})

return res.status(200)
.json(new ApiResponse(200 , {content : UpdatedComment} , "Comment Updated Successfully"))
})


const deleteComment = asyncHandler(async(req , res)=>{
  const {commentId} = req.params;

  if(!commentId){
    throw new ApiError(402 , " CommentId is missing")
  }

const existingComment = await Comment.findById(commentId).populate('video')

if(!existingComment){
    throw new ApiError(401 , "Comment not exist")
}

if(!existingComment.owner.equals(req.user._id) &&  !existingComment.video.owner.equals(req.user._id)){
    throw new ApiError(402 , "Unauthorized Request")
}

await Comment.findByIdAndDelete(commentId)
  return res.status(200)
  .json(new ApiResponse(200 , {} , "Comment deleted Successfully"))

})



    
export {getVideoComments , addComments , updateComment , deleteComment }