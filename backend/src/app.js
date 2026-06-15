import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from "path";
import userRouter from './routes/user.router.js';
import interviewRouter from './routes/interview.router.js';
import resultRouter from './routes/result.router.js';
import objectRouter from './routes/object.router.js';
import adminRouter from './routes/admin.router.js';
import dashboardRouter from './routes/dashboard.router.js';
import { RateLimiter15mins } from "./utils/RateLimiter.js";


const app = express()

const objectStorePath = path.resolve("../objectStore");

// Serve static files from the 'objectStore' directory
app.use("/api/v1/objectStore", express.static(objectStorePath));
// Serve static files from the 'public' directory
app.use("/public", express.static(path.resolve("./public")));

app.use(cors({
  origin: [
    'https://glamis.in',
    'https://admin.glamis.in',
    'http://localhost:3000',
    'http://localhost:4000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:4000'
  ],
  credentials: true
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended : true, limit : "16kb" }))
app.use(cookieParser())
app.use(RateLimiter15mins)

// Routes Import


app.use("/api/v1/users", userRouter)
app.use("/api/v1/interview", interviewRouter)
app.use("/api/v1/result", resultRouter)
app.use("/api/v1/objectStore", objectRouter)
app.use("/api/v1/admin", adminRouter)
app.use("/api/v1/dashboard", dashboardRouter)


// health check route

app.get("/api/v1/healthCheck", (req, res)=>{
    res.status(200).json({
        status : "success",
        message : "Health Check is OK"
    })
})

export default app;
