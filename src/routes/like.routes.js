import { Router } from "express"; 
import {getLikeVideosDetails , 
    toggleTweetLike , 
    toggleCommentLike , 
     toggleVideoLike } from "../controllers/like.controller.js"

const router = Router()
router.route("/toggle/v/:videoId").post(toggleVideoLike);
router.route("/toggle/c/:commentId").post(toggleCommentLike);
router.route("/toggle/t/:tweetId").post(toggleTweetLike);
router.route("/videos").post(getLikeVideosDetails);
export default router
