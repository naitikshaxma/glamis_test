import mongoose from "mongoose";
import { User } from "./src/models/users.models.js";
import dotenv from "dotenv";

dotenv.config();

const DB_NAME = "glamis";

mongoose.connect(process.env.MONGODB_URI + DB_NAME)
    .then(async () => {
        console.log("Connected to DB to update admin status...");
        const user = await User.findOneAndUpdate(
            { email_id: 'deepak.singh_cs.aiml24@gla.ac.in' },
            { is_admin: true },
            { new: true }
        );
        if (user) {
            console.log("Successfully updated user to Admin:", user.email_id, "is_admin:", user.is_admin);
        } else {
            console.log("User not found!");
        }
        process.exit(0);
    })
    .catch(err => {
        console.error("DB Connection Error:", err);
        process.exit(1);
    });
