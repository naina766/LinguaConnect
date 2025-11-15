import express from "express";
import { generateReply } from "../services/chatbotService";
import { sendResponse } from "../utils/responseHandler";

const router = express.Router();

router.post("/reply", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return sendResponse(res, 400, "Question required");

    const reply = await generateReply(question);

    sendResponse(res, 200, "OK", { reply });
  } catch (err: any) {
    console.error("❌ Error in /reply route:", err.message);
    sendResponse(res, 500, "Chatbot failed to generate reply", { error: err.message });
  }
});

export default router;
