import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from "path";
// import { RateLimiter15mins } from "./utils/RateLimiter.js";


const app = express()

const objectStorePath = path.resolve("../objectStore");

// Serve static files from the 'objectStore' directory
app.use("/api/v1/objectStore", express.static(objectStorePath));

app.use(cors())

app.use(express.json({ limit : "16kb" }))
app.use(express.urlencoded({ extended : true, limit : "16kb" }))
app.use(cookieParser())

// Routes Import

import userRouter from './routes/user.router.js';
import interviewRouter from './routes/interview.router.js';
import resultRouter from './routes/result.router.js';
import objectRouter from './routes/object.router.js';
import adminRouter from './routes/admin.router.js';

app.use("/api/v1/users", userRouter)
app.use("/api/v1/interview", interviewRouter)
app.use("/api/v1/result", resultRouter)
app.use("/api/v1/objectStore", objectRouter)
app.use("/api/v1/admin", adminRouter)


// health check route

app.get("/api/v1/healthCheck", (req, res)=>{
    res.status(200).json({
        status : "success",
        message : "Health Check is OK"
    })
})

export default app;