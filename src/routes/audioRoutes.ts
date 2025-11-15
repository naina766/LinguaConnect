import { Router } from "express";
import { audioToChat } from "../controllers/audioChatController";
import { upload } from "../middleware/upload"; // multer setup

const router = Router();

router.post("/audio-chat", upload.single("file"), audioToChat);

export default router;
