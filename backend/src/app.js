import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
// import { RateLimiter15mins } from "./utils/RateLimiter.js";
import userRouter from './routes/user.router.js';

const app = express()

app.use(cors({
    origin : process.env.CORS_ORIGIN
}))

app.use(express.json({ limit : "16kb" }))
app.use(express.urlencoded({ extended : true, limit : "16kb" }))
app.use(cookieParser())

// Routes Import


app.use("/api/v1/users", userRouter)


// health check route

app.get("/api/v1/healthCheck", (req, res)=>{
    res.status(200).json({
        status : "success",
        message : "Health Check is OK"
    })
})

export default app;