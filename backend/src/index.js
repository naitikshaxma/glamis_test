import dotenv from "dotenv";
dotenv.config({ override: true });
import connectDB from "./db/index.js";
import connectRedis from "./db/redis.connect.js";
import app from "./app.js";
import logger from 'log-timestamp';


// set log-timestamp in current time zone
logger(() => (`\x1b[35m \[${new Date().toLocaleString()}\]\x1b[0m` + ' %s'))


const start = async () => {
    try {
        await connectDB()
        try {
            const redis = await connectRedis()
            if (!redis || !redis.isOpen) {
                console.error("CRITICAL WARNING: Redis connection failed. OTP verification and session cache features will not work.");
            }
        } catch (redisError) {
            console.error("CRITICAL ERROR: Failed to connect to Redis server during startup:", redisError.message);
        }
        const port = process.env.PORT || 8000
        const displayURL = `http://localhost:${port}`
        app.listen(port, ()=>{
            console.log(`Server is Running on ${displayURL}`)
        })
    } catch (error) {
        console.log(`Mongo DB connection FAILED !! ${error}`)
    }
}

start()
