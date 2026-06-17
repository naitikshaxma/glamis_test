import mongoose from "mongoose";
import { AdminCompanyInterview } from "./src/models/interview.models.js";
import dotenv from "dotenv";

dotenv.config();

const DB_NAME = "glamis";

mongoose.connect(process.env.MONGODB_URI + DB_NAME)
    .then(async () => {
        const admins = await AdminCompanyInterview.find();
        console.log("Total AdminCompanyInterviews:", admins.length);
        admins.forEach(a => {
            console.log("Admin ID:", a._id, "Interviews array:", a.interview);
        });
        process.exit(0);
    })
    .catch(err => {
        console.error("DB Connection Error:", err);
        process.exit(1);
    });
