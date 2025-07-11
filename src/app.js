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

//routes declaration
app.use("/api/v1/users" , userRouter);
app.use("/api/v1/healthcheck" , healthcheckRouter);

app.use("/api/v1/tweets" , tweetRouter)

//https://localhost:8000/api/v1/users/register
//https://localhost:8000/api/v1/healthcheck/healthcheck
//https://localhost:8000/api/v1/tweets/createTweet







export {app}