import mongoose, { Schema } from "mongoose";

const playlistSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    descriptions : {
        type : String,
        required : true
    },
    videos : {
        type : mongoose.Schema.Types.ObjectId,
        ref:"Video"
    } , 
    owner : {
         type : mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})
export const PlayList = mongoose.model("PlayList" , playlistSchema)