import mongoose from "mongoose";
import { User, Student } from "./src/models/users.models.js";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const DB_NAME = "glamis";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/";

async function run() {
  try {
    await mongoose.connect(MONGODB_URI + DB_NAME);
    console.log("Connected to MongoDB.");

    let admin = await User.findOne({ email_id: "admin@glamis.in" });
    if (!admin) {
      const uniquePhone = "9" + Math.floor(100000000 + Math.random() * 900000000).toString();
      admin = await User.create({
        name: "Admin User",
        email_id: "admin@glamis.in",
        phone: uniquePhone,
        is_admin: true,
        password: "adminpassword", // Will be hashed automatically by pre-save hook
        is_email_verified: true
      });
      console.log("Admin user created.");
    } else {
      admin.is_admin = true;
      await admin.save();
      console.log("Admin user found and verified is_admin = true.");
    }

    const token = admin.generateAccessToken();
    console.log("=== ADMIN_TOKEN ===");
    console.log(token);
    console.log("===================");

    // Create a dummy student
    let studentUser = await User.findOne({ email_id: "student@glamis.in" });
    if (!studentUser) {
      const studentPhone = "8" + Math.floor(100000000 + Math.random() * 900000000).toString();
      studentUser = await User.create({
        name: "Student User",
        email_id: "student@glamis.in",
        phone: studentPhone,
        is_admin: false,
        password: "studentpassword",
        is_email_verified: true
      });
      console.log("Student user created.");
    }

    let student = await Student.findOne({ user: studentUser._id });
    if (!student) {
      student = await Student.create({
        user: studentUser._id,
        token: 10,
        course: "B.Tech",
        branch: "CSE",
        semester: 6,
        section: "A",
        rollNo: 20150001
      });
      console.log("Student profile created.");
    }

    const studentToken = studentUser.generateAccessToken();
    console.log("=== STUDENT_TOKEN ===");
    console.log(studentToken);
    console.log("=== STUDENT_ID ===");
    console.log(student._id.toString());
    console.log("=== STUDENT_USER_ID ===");
    console.log(studentUser._id.toString());
    console.log("=====================");

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

run();
