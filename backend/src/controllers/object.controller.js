import fs from "fs";
import path from "path";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const getAudioFile = asyncHandler(async (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.resolve("../objectStore", filename);
        if (!fs.existsSync(filePath || !fs.lstatSync(filePath).isFile())) {
            return res.status(404).json(
                new ApiResponse(404, null, "File not found")
            );
        }

        return res.sendFile(filePath, (err) => {
            if (err) {
                console.log(err);
                return res.status(err.status).json(
                    new ApiResponse(err.status, null, err.message)
                );
            }
        });

    }
    catch (err) {
        return res.status(500).json(
            ApiError(500, err.message || "Internal Server Error")
        );
    }
})

export default getAudioFile;