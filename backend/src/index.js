import dotenv from "dotenv";
dotenv.config({ override: true });
import connectDB from "./db/index.js";
import connectRedis from "./db/redis.connect.js";
import app from "./app.js";
import logger from 'log-timestamp';
import { initScheduler } from "./jobs/assignmentScheduler.js";
import { initAssignmentWorker } from "./jobs/assignmentWorker.js";
import { initNotificationWorker } from "./jobs/notificationWorker.js";
import { initReassessmentWorker } from "./jobs/reassessmentWorker.js";


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

        // Initialize AI assignment scheduler and workers (Step 5)
        await initScheduler().catch(err => {
            console.error("Failed to initialize scheduler:", err.message);
        });
        // Only initialize BullMQ workers if Redis is compatible (>= 5.0)
        // Otherwise the scheduler already started the in-memory fallback
        const { getSystemStatus } = await import("./jobs/assignmentScheduler.js");
        if (getSystemStatus() === "HEALTHY") {
            initAssignmentWorker();
            initNotificationWorker();
            initReassessmentWorker();
            console.log("BullMQ workers initialized (Redis is compatible).");
        } else {
            console.log("BullMQ workers skipped — running in-memory fallback scheduler (Redis < 5.0 or unavailable).");
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
