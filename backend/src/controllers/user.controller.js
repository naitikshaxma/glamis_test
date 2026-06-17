import { User } from "../models/users.models.js"
import { isEmpty } from "../utils/isEmptyFields.js"
import { createOtp } from "../utils/helpers.js"
import jwt from "jsonwebtoken"
import sendMail from "../utils/sendMail.js"
import connectRedis from "../db/redis.connect.js"
import OTPTemplate from "../utils/emailTemplates/OTP.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Student } from "../models/users.models.js"

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {
            accessToken,
            refreshToken
        }
    } catch (error) {
        throw new Error(`Token generation failed: ${error.message}`);
    }
}

const signup = asyncHandler(async (req, res) => {
    console.log(req.body)
    const { name, email_id, phone, password, confirm_password } = req.body;

    if (isEmpty(name) || isEmpty(email_id) || isEmpty(phone) || isEmpty(password) || isEmpty(confirm_password)) {
        return res.status(400).json(ApiError(400, "All fields are required"))
    }

    if (password !== confirm_password) {
        return res.status(400).json(ApiError(400, "Password do not match"))
    }

    console.log("yaha tak aa gye")
    const user = await User.findOne({ $or: [{ email_id }, { phone }] })

    if (user && user.is_email_verified) {
        return res.status(409).json(ApiError(409, "User already exists"))
    }

    if (user && !user.is_email_verified) {
        console.log("User already exists but email not verified");
        user.name = name;
        user.phone = phone;
        user.password = password;
        await user.save();
        const otp = createOtp();
        console.log(`\n>>> [OTP VERIFICATION] OTP for ${email_id} is: ${otp} <<<\n`);
        await sendMail(email_id, "OTP Verification", OTPTemplate(otp));




        // push otp to redis cache
        let redisClient;
        try {
            redisClient = await connectRedis()
            await redisClient.set(email_id, otp);
            await redisClient.expire(email_id, 600);
        } catch (error) {
            console.log("Error while connecting to Redis", error)
        }

        return res.status(201).json(new ApiResponse(200, {}, "User details updated. Please verify your email to continue."));
    }

    console.log("yaha tak aa gye 2")

    const otp = createOtp();
    console.log(`\n>>> [OTP VERIFICATION] OTP for ${email_id} is: ${otp} <<<\n`);
    await sendMail(email_id, "OTP Verification", OTPTemplate(otp));




    // push otp to redis cache
    let redisClient;
    try {
        redisClient = await connectRedis()
        await redisClient.set(email_id, otp);
        await redisClient.expire(email_id, 600);
    } catch (error) {
        console.log("Error while connecting to Redis", error)
    }

    const userCreating = await User.create({
        name,
        email_id,
        phone,
        password
    })

    const createdUser = await User.findOne({ _id: userCreating._id }).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        return res.status(500).json(ApiError(500, "Something might be up with the server"))
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "Account Created Successfully")
    )
})

const login = asyncHandler(async (req, res) => {
    // todos : 

    /*

    1. get email and password - done
    2. check if email is validated or not and same with password - done
    3. if exists then validate password - done
    4. check if user exists or not, if yes geneate accesstoken and refresh token and send user in a cookies(Secure) - done

     */

    const { email, password } = req.body;
    if (isEmpty(email) || isEmpty(password)) {
        return res.status(401).json(ApiError(401, "Please Fill All the fields"))
    }

    const isUser = await User.findOne({ email_id: email })

    console.log(isUser)

    if (isUser === null) {
        return res.status(404).json(ApiError(404, "User Doesn't Exists"))
    }

    let isPasswordCorrectResponse = await isUser.isPasswordCorrect(password)
    if (!isPasswordCorrectResponse) {
        return res.status(401).json(ApiError(401, "Password do not match"))
    }

    if (!isUser.is_email_verified) {
        return res.status(401).json(ApiError(401, "Please Verify Your Email"))
    }

    const { refreshToken, accessToken } = await generateAccessAndRefreshTokens(isUser._id)

    const loggedInUser = await User.findById(isUser._id).select("-password -refreshToken")

    const options = {
        httpOnly: true, // can only be modified by server not by client-side
        secure: true
    }

    const isStudent = await Student.findOne({ user: isUser._id })

    if (!isStudent) {
        const student = await Student.create({
            user: isUser._id,
            token: 4,
            avatar: "path/to/avatar.png",
            interview_taken: [],
            course: "B.Tech",
            branch: "Computer Science",
            semester: 6,
            section: "A",
            address: "GLA University, Mathura",
            idCard: "path/to/idCard.png",
            resume: "path/to/resume.pdf"
        })
    }

    return res
        .status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, {
                userData: loggedInUser,
                refreshToken,
                accessToken,
                isAdmin: isUser.is_admin
            }, "LoggedIn Successfully")
        )
})


const logout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $set: {
            refreshToken: undefined
        }
    },
        {
            new: true
        })

    const options = {
        httpOnly: true, // can only be modified by server not by client-side
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "loggedOut Successfully")
        )
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.header("Authorization")?.replace("Bearer ", "");
    if (isEmpty(incomingRefreshToken)) {
        return res.status(404).json(ApiError(404, "Unauthorized Request"))
    }

    try {
        const decodedRefreshToken = await jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedRefreshToken._id)

        if (!user) {
            return res.status(404).json(ApiError(404, "Please send Valid Refresh Token"))
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            return res.status(404).json(ApiError(404, "Token May be Expired"))
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id)

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
            .status(201)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(200, {
                    accessToken,
                    refreshToken: newRefreshToken
                }, "Token Refreshed Successfully!")
            )
    } catch (error) {
        return res.status(500).json(ApiError(500, "Internal Server Error while Refreshing Access Token"))
    }
})


const verifyEmail = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (isEmpty(email) || isEmpty(otp)) {
        return res.status(401).json(ApiError(401, "Please Fill All the fields"))
    }

    const user = await User.findOne({ email_id: email })

    if (!user) {
        return res.status(404).json(ApiError(404, "User Doesn't Exists"))
    }

    const redisClient = await connectRedis()

    const expectedOTP = await redisClient.get(email)
    if (user.is_email_verified) {
        return res.status(200).json(new ApiResponse(200, {}, "Email Verified Successfully"))
    }
    if (expectedOTP !== otp) {
        return res.status(401).json(ApiError(401, "Invalid OTP"))
    }
    if (expectedOTP === otp) {
        await User.findByIdAndUpdate(user._id, {
            $set: {
                is_email_verified: true
            }
        },
            {
                new: true
            })

        return res.status(200).json(new ApiResponse(200, {}, "Email Verified Successfully"))
    }
    if (expectedOTP === null) {
        return res.status(401).json(ApiError(401, "OTP Expired"))
    }

})

const resendOTP = asyncHandler(async (req, res) => {
    const { email } = req.body;
    console.log(email)

    if (isEmpty(email)) {
        return res.status(401).json(ApiError(401, "Please Fill All the fields"))
    }

    const user = await User.findOne({ email_id: email })

    if (!user) {
        return res.status(404).json(ApiError(404, "User Doesn't Exists"))
    }

    const otp = createOtp();
    console.log(`\n>>> [OTP RESEND] OTP for ${email} is: ${otp} <<<\n`);
    await sendMail(email, "OTP Verification", OTPTemplate(otp));

     const redisClient = await connectRedis()

     await redisClient.set(email, otp);
     await redisClient.expire(email, 600);

    return res.status(200).json(new ApiResponse(200, {}, "OTP Sent Successfully"))
})

const verifyUser = asyncHandler(async (req, res) => {
    const { accessToken } = req.body;

    if (!accessToken) {
        return res.status(401).json(ApiError(401, "Access token missing"));
    }

    try {
        // Verify the access token
        const decodedAccessToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedAccessToken._id);

        if (!user) {
            return res.status(404).json(ApiError(404, "User doesn't exist for the provided token"));
        }

        console.log("User verified successfully");
        return res.status(200).json(new ApiResponse(200, { user }, "User verified successfully"));
    } catch (error) {
        // Send proper error response
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json(ApiError(401, "Token has expired"));
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json(ApiError(401, "Invalid token"));
        } else {
            return res.status(500).json(ApiError(500, error.message || 'An unexpected error occurred'));
        }
    }
});






const addStudent = asyncHandler(async (req, res) => {
    const { user_id } = req.body;

    const user = await User.findById(user_id)

    if (!user) {
        return res.status(404).json(ApiError(404, "Student Doesn't Exists"))
    }

    const student = await Student.create({
        user: user_id,
        token: 4,
        avatar: "path/to/avatar.png",
        interview_taken: [],
        course: "B.Tech",
        branch: "Computer Science",
        semester: 6,
        section: "A",
        address: "GLA University, Mathura",
        idCard: "path/to/idCard.png",
        resume: "path/to/resume.pdf"
    })

    return res.status(201).json(new ApiResponse(200, student, "Student Added Successfully"))
})

const updateStudent = asyncHandler(async (req, res) => {
    const { user_id } = req.body;

    const user = await User.findById(user_id)

    if (!user) {
        return res.status(404).json(ApiError(404, "Student Doesn't Exists"))
    }

    const student = await Student.findOneAndUpdate({ user: user_id }, req.body, {
        new: true
    })

    return res.status(200).json(new ApiResponse(200, student, "Student Updated Successfully"))
});

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (isEmpty(email)) {
        return res.status(401).json(ApiError(401, "Please Fill All the fields"))
    }
    const user = await User.findOne({ email_id: email })
    if (!user) {
        return res.status(404).json(ApiError(404, "User Doesn't Exists"))
    }
    if (user && !user.is_email_verified) {
        return res.status(401).json(ApiError(401, "Email is not verified"))
    }

    const otp = createOtp();
    console.log(`\n>>> [PASSWORD RESET OTP] OTP for ${email} is: ${otp} <<<\n`);
    await sendMail(email, "Password Reset OTP", `You are receiving the otp because you requested for password reset OTP: ${otp}`);

    // push otp to redis cache
    let redisClient;
     try {
         redisClient = await connectRedis()
         await redisClient.set(email, otp);
         await redisClient.expire(email, 600);
     } catch (error) {
        console.log("Error while connecting to Redis", error)
    }
    return res.status(200).json(new ApiResponse(200, {}, "Password Reset OTP Send Successfully"));
})

const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (isEmpty(email) || isEmpty(otp) || isEmpty(newPassword) || isEmpty(confirmPassword)) {
        return res.status(401).json(ApiError(401, "Please Fill All the fields"))
    }

    const user = await User.findOne({ email_id: email })

    if (!user) {
        return res.status(404).json(ApiError(404, "User Doesn't Exists"))
    }

    const redisClient = await connectRedis()

    const expectedOTP = await redisClient.get(email)

    if (expectedOTP !== otp) {
        return res.status(401).json(ApiError(401, "Invalid OTP"))
    }

    if (expectedOTP === null) {
        return res.status(401).json(ApiError(401, "OTP Expired"))
    }
    if (expectedOTP === otp) {
        user.password = newPassword;
        await user.save();
    }
    return res.status(200).json(new ApiResponse(200, {}, "Password reset Successfully"))
})

const getUserDataForProfile = asyncHandler(async (req, res) => {
    // console.log(req.header("Authorization"))
    const accessToken = req.header("Authorization")?.replace("Bearer ", "");
    // console.log(accessToken) 

    if (!accessToken) {
        return res.status(400).json(ApiError(400, "Access token not present"))
    }

    try {
        const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        const student = await Student.findOne({ user: decodedToken._id }).populate('user', '-password -refreshToken'); // select student data along with user data

        if (!student) {
            return res.status(404).json(ApiError(404, "User not found"));
        }

        return res.status(200).json(new ApiResponse(200, student, "User found successfully"))
    } catch (err) {
        console.log("Error in fetching user data: ", err);
        return res.status(500).json(ApiError(500, err.message || "Internal Server Error"))
    }
})

const updateStudentData = asyncHandler(async (req, res) => {
    const accessToken = req.header("Authorization")?.replace("Bearer ", "");

    if (!accessToken) {
        return res.status(400).json(ApiError(400, "Access token not present"))
    }

    try {
         const { section, course, branch } = req.body;
         let { semester } = req.body;
         
         // Handle Roman numeral conversion
         if (typeof semester === 'string') {
             const romanMap = {
                 'I': 1, 'II': 2, 'III': 3, 'IV': 4,
                 'V': 5, 'VI': 6, 'VII': 7, 'VIII': 8
             };
             semester = romanMap[semester] || parseInt(semester);
         } else {
             semester = Number.parseInt(semester);
         }

         // Validate semester is within valid range
         if (isNaN(semester) || semester < 1 || semester > 8) {
             return res.status(400).json(ApiError(400, "Invalid semester value"));
         }

         const updateFields = {};
         if (semester) updateFields.semester = semester;
         if (section) updateFields.section = section;
         if (branch) updateFields.branch = branch;
         if (course) updateFields.course = course;

        const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        const updatedStudent = await Student.findOneAndUpdate({ user: decodedToken._id }, updateFields, { new: true });
        console.log(updatedStudent)

        if (!updatedStudent) {
            return res.status(404).json(ApiError(404, "Student not updated"));
        }

        return res.status(200).json(new ApiResponse(200, updatedStudent, "User Updated Successfully"))

    } catch (err) {
        console.log(err);
        return res.status(500).json(ApiError(500, "Internal Server Err"))
    }
})

const updatePersonalData = asyncHandler(async (req, res) => {
    try {
        const { rollNo, address, deleteResume } = req.body;
        const hasAvatar = req.files && req.files.avatar && req.files.avatar[0];
        const hasResume = req.files && req.files.resume && req.files.resume[0];

        const isDeletingResume = deleteResume === "true" || deleteResume === true;

        if (isEmpty(rollNo) && isEmpty(address) && !hasAvatar && !hasResume && !isDeletingResume) {
            return res.status(400).json(ApiError(400, "Empty data"))
        };

        const updateFields = {};

        if (rollNo) updateFields.rollNo = rollNo;
        if (address) updateFields.address = address;

        if (hasAvatar) {
            updateFields.avatar = `/public/user-photos/${req.files.avatar[0].filename}`;
        }
        if (hasResume) {
            updateFields.resume = `/public/resumes/${req.files.resume[0].filename}`;
        } else if (isDeletingResume) {
            updateFields.resume = "path/to/resume.pdf";
        }

        const updateStudent = await Student.findOneAndUpdate({ user: req.user._id }, updateFields, { new: true });

        if (!updateStudent) {
            return res.status(400).json(ApiError(400, "Student not updated"))
        }

        return res.status(200).json(new ApiResponse(200, updateStudent, "Student Updated"));

    } catch (err) {
        console.log(err)
        return res.status(500).json(ApiError(500, "Internal Server Error"));
    }
})

const feedback = asyncHandler(async (req, res) => {
    // console.log(req.body);
    let data = req.body;
    const emailObject = data.find(item => item.title === 'University Email Id');
    const email = emailObject ? emailObject.response : null;
    console.log(email);
    if (email) {
        const student = await User.findOne({ email_id: email });
        student.feedback_submitted = true;
        const updated_student = await student.save();
        console.log(updated_student);
    }
    return res.status(200).json("working fine");
})
const savePhoto = asyncHandler(async (req, res) => {
    if (!req.file) {
        console.log("no photo uploaded");
    } else {
        const user = await User.findOne({ email_id: req.user.email_id });
        console.log(user);
        if (user.interview_photos.length < 5) {
            user.interview_photos.push(`/user-photos/${req.file.filename}`);
        }
        await user.save();
        console.log("uploaded", req.file.filename);
    }
    res.status(200).json({ message: "photo save successfuly" });
})

export {
    signup,
    login,
    logout,
    refreshAccessToken,
    verifyEmail,
    resendOTP,
    addStudent,
    updateStudent,
    verifyUser,
    forgotPassword,
    resetPassword,
    getUserDataForProfile,
    updateStudentData,
    updatePersonalData,
    feedback,
    savePhoto
}