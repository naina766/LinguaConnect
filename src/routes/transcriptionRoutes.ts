import { Router } from "express";
import multer from "multer";
import { transcribeAudio } from "../controllers/transcriptionController";

const router = Router();
const upload = multer({ dest: "uploads/" }); // temp folder for uploads

router.post("/transcribe", upload.single("audio"), transcribeAudio);

export default router;
