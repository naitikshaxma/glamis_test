import multer from "multer";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { speechToText } from "../utils/speechToText.js";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer( { storage });

const extractAnswerAudio = upload.single('answerAudio');

const handleAudioUpload = asyncHandler(async (req, res, next) => {
    try {
        if (!req.file) {
            throw new Error("File not uploaded");
        }

        console.log(req.file);

        const text = await speechToText(req.file.path);
        console.log(text);
        req.extractedAnswer = text;
        next();
    } catch (error) {
        return res.status(500).json(ApiError(500, error.message ||   "Internal Server Error in extractAnswerAudio"));
    }
});

export { extractAnswerAudio, handleAudioUpload };