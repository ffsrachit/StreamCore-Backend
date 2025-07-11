import { Router } from "express";
import { changeCurrentPaaword,
    getCurrentUser,
     getUserChannelProfile,
      getWatchHistory,
       loginUser,
        logoutUser,
         refreshAccessToken,
          registerUser,
           updateAccountCredentials,
            updateCoverImage,
             updateUserAvatar } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
     {
        name:"avatar",
        maxCount:1           // ab image bhej paaogen
     },
     {
        name :"coverImage",
        maxCount :1
     }
    ]),
   

    registerUser)
router.route("/login").post(loginUser)


// secured routes


router.route("/logout").post(verifyJWT ,logoutUser)
router.route("/refresh-Token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT , changeCurrentPaaword)
router.route("/current-user").get(verifyJWT , getCurrentUser)
router.route("/update-account").patch(updateAccountCredentials)
router.route("/avatar").patch(verifyJWT , upload.single ("avatar") , updateUserAvatar)
router.route("/coverImage").patch(verifyJWT , upload.single("/coverImage") , updateCoverImage)
router.route("/c/:username").get(verifyJWT , getUserChannelProfile)
router.route("/history").get(verifyJWT , getWatchHistory)


export default router
