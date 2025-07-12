import mongoose from "mongoose";
import { ApiError } from "../utils/APiError.js";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import {Video} from "../models/video.model.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query="", sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const sortOrder = sortType == "asc" ? 1 : -1;
    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    }

    const filteredPaginatedVideos = await Video.aggregatePaginate(Video.aggregate([
        {
            $match:{
               $or:[{
                title: {$regex: query , $options: "i"}
               } , {
                description: {$regex: query , $options: "i"}
               }]
            }
        },
        {
            $sort: {[sortBy]: sortOrder}
        }
    ]) , options);

    return res.status(200).json(new ApiResponse(200 , {
        videos: filteredPaginatedVideos
    } , "sorted filtered videos with pagination has been fetched successfully"));

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!videoId){
        throw new ApiError(400 , "video id is not provided");
    }
    const fullVideo = await Video.aggregate([
        {
            $match:{
                _id: new mongoose.Schema.Types.ObjectId(videoId)
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerInfo",
                pipeline:[
                    {
                        $project:{
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            },
        },
        {
            $unwind:{
                path: "$ownerInfo",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project:{
                owner: 0
            }
        }
    ])
    if(!fullVideo.length){
        throw new ApiError(404 , "video not found");
    }
    
    return res.status(200).json(new ApiResponse(200 , {
        fullVideo: fullVideo[0]
    }, "video with owner details fetched successfully"));
})


export {
getAllVideos ,
getVideoById , 
gglePublishStatus
}