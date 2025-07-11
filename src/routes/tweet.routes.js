import { Router } from "express";
import {createTweet , UpdateTweet , deleteTweet , getUserTweets} from "../controllers/tweet.controller.js"
const router = Router();


router.route('/create').post(createTweet)

router.route('/user/:userId').get(getUserTweets)
router.route('/:tweetId').delete(deleteTweet)
router.route('/:tweetId').patch(UpdateTweet)
export default router