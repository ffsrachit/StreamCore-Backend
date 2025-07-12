import { Router } from "express";
import {getVideoComments , addComments , updateComment , deleteComment} from "../controllers/comment.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()
router.use(verifyJWT)
router.route('/:VideoId').get(getVideoComments).post(addComments)
router.route("/c/:commentId").delete(deleteComment).patch(updateComment)
export default router