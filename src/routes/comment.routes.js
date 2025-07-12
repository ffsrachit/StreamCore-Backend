import { Router } from "express";
import {getVideoComments , addComments , updateComment , deleteComment} from "../controllers/comment.controller.js"

const router = Router()
router.route('/:VideoId').get(getVideoComments).post(addComments)
router.route("/c/:commentId").delete(deleteComment).patch(updateComment)
export default router