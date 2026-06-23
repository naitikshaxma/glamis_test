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
import avatarRouter from './routes/avatar.router.js';
import assignmentRouter from './routes/assignment.router.js';
import notificationRouter from './routes/notification.router.js';
import { RateLimiter15mins } from "./utils/RateLimiter.js";


const app = express()

const objectStorePath = path.resolve("../objectStore");
const publicPath = path.resolve("public");

// Serve static files
app.use("/api/v1/objectStore", express.static(objectStorePath));
app.use("/public", express.static(publicPath));

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : [
      'https://glamis.in',
      'https://admin.glamis.in',
      'http://localhost:3000',
      'http://localhost:4000',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:4000',
      'http://localhost:5173',
      'http://127.0.0.1:5173'
    ];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }
    if (process.env.NODE_ENV === 'production') {
      callback(null, allowedOrigins.includes(origin) ? origin : false);
      return;
    }
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  optionsSuccessStatus: 204
};

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

app.use(cors(corsOptions));

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
app.use("/api/v1/avatar", avatarRouter)
app.use("/api/v1", assignmentRouter)
app.use("/api/v1/notifications", notificationRouter)


// health check route

app.get("/api/v1/healthCheck", (req, res)=>{
    res.status(200).json({
        status : "success",
        message : "Health Check is OK"
    })
})

export default app;
