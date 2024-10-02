import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";

dotenv.config()


const start = async () => {
    try {
        await connectDB()
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
