import { Router } from "express";
import {getVideoById  ,getAllVideos} from '../controllers/video.controller.js'
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()
router.use(verifyJWT)

router.route("/").get(getAllVideos)
router.route("/:videoId").get(getVideoById)
export default router