import { Router } from "express";
import { audioToChat } from "../controllers/audioChatController";
import { upload } from "../middleware/upload"; // multer setup
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
router.use(authMiddleware);

router.post("/audio-chat", upload.single("file"), audioToChat);

export default router;
