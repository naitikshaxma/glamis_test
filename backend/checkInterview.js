import mongoose from "mongoose";
import { Interview, AdminSubjectInterview, AdminCompanyInterview, AdminSvarInterview, AdminVerbalInterview, AdminWrittenInterview } from "./src/models/interview.models.js";
import dotenv from "dotenv";

dotenv.config();

const DB_NAME = "glamis";

mongoose.connect(process.env.MONGODB_URI + DB_NAME)
    .then(async () => {
        console.log("Connected to DB...");
        const interviews = await Interview.find().sort({createdAt: -1}).limit(5);
        console.log("Latest Interviews:");
        interviews.forEach(i => console.log(i._id, i.title, i.type));

        if (interviews.length > 0) {
            const id = interviews[0]._id;
            console.log("\nChecking Admin Interviews for:", id);
            
            const checks = await Promise.all([
                AdminCompanyInterview.findOne({interview: id}),
                AdminSubjectInterview.findOne({interview: id}),
                AdminVerbalInterview.findOne({interview: id}),
                AdminWrittenInterview.findOne({interview: id}),
                AdminSvarInterview.findOne({interview: id}),
            ]);
            
            console.log("AdminCompany:", !!checks[0]);
            console.log("AdminSubject:", !!checks[1]);
            console.log("AdminVerbal:", !!checks[2]);
            console.log("AdminWritten:", !!checks[3]);
            console.log("AdminSvar:", !!checks[4]);
        }
        
        process.exit(0);
    })
    .catch(err => {
        console.error("DB Connection Error:", err);
        process.exit(1);
    });
