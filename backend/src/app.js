const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const {RateLimiter15mins} = require("./utils/RateLimiter.js")

const app = express()

app.use(cors({
    origin : process.env.CORS_ORIGIN
}))

app.use(express.json({ limit : "16kb" }))
app.use(express.urlencoded({ extended : true, limit : "16kb" }))
app.use(cookieParser())

// Routes Import

const userRouter = require("./routes/user.router.js")

app.use("/api/v1/users", userRouter)


// health check route

app.get("/api/v1/healthCheck", (req, res)=>{
    res.status(200).json({
        status : "success",
        message : "Health Check is OK"
    })
})

module.exports = { app }