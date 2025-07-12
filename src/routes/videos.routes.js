import { Router } from "express";
import {getVideoById  ,getAllVideos} from '../controllers/video.controller.js'
const router = Router()

router.route("/").get(getAllVideos)
router.route("/:videoId").getVideoById
export default router