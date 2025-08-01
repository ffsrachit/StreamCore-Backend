import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()
app.use(cors({
    origin :process.env.CORS_ORIGIN,
    credentials : true
}))

app.use(express.json({limit : "16kb"}))
app.use(express.urlencoded({extended:true , limit : "16kb"}))  // data receive

app.use(express.static("public"))

app.use(cookieParser())



//routes

import userRouter from './routes/user.routes.js'
import healthcheckRouter from './routes/healthcheck.routes.js'
import tweetRouter from './routes/tweet.routes.js'
import commentRouter from './routes/comment.routes.js'
import likeRouter from './routes/like.routes.js'
import videoRouter from './routes/videos.routes.js'
import dashboardRouter from './routes/dashboard.routes.js'

//routes declaration
app.use("/api/v1/users" , userRouter);
app.use("/api/v1/healthcheck" , healthcheckRouter);

app.use("/api/v1/tweets" , tweetRouter)
app.use("/api/v1/Comments" , commentRouter)
app.use("/api/v1/likes" , likeRouter)
app.use("/api/v1/videos" , videoRouter)
app.use("/api/v1/dashboard" ,dashboardRouter )

//https://localhost:8000/api/v1/users/register
//https://localhost:8000/api/v1/healthcheck/healthcheck
//https://localhost:8000/api/v1/tweets/createTweet







export {app}