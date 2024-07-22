import { Router } from "express";
import getAudioFile from "../controllers/object.controller.js";
const router = Router();

router.route("/:filename").post(getAudioFile);

export default router;