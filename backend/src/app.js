import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
// import { RateLimiter15mins } from "./utils/RateLimiter.js";


const app = express()

app.use(cors())

app.use(express.json({ limit : "16kb" }))
app.use(express.urlencoded({ extended : true, limit : "16kb" }))
app.use(cookieParser())

// Routes Import

import userRouter from './routes/user.router.js';
import interviewRouter from './routes/interview.router.js';


app.use("/api/v1/users", userRouter)
app.use("/api/v1/interview", interviewRouter)


// health check route

app.get("/api/v1/healthCheck", (req, res)=>{
    res.status(200).json({
        status : "success",
        message : "Health Check is OK"
    })
})

export default app;