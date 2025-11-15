// src/controllers/audioToChatController.ts
import { Request, Response } from "express";
import { promises as fs } from "fs";
import { transcribeAudio } from "../services/audioService";
import { generateReply } from "../services/chatbotService";
import { detectLanguage, mapToNLLB } from "../services/detectService";
import { translateText } from "../services/translationService"; // your external API
import { sendResponse } from "../utils/responseHandler";

/**
 * Safe translation helper
 */
async function safeTranslate(text: string, from: string, to: string): Promise<string> {
  if (!text) return "";
  if (from === to) return text;
  try {
    const t = await translateText(text, from, to);
    return t?.translated || text;
  } catch (err: any) {
    console.warn(`Translation failed (${from} -> ${to}):`, err.message || err);
    return text;
  }
}

export const audioToChat = async (req: Request, res: Response) => {
  const file = req.file as Express.Multer.File;
  const userLangInput = req.body.language as string | undefined;

  if (!file) return sendResponse(res, 400, "Audio file is required");

  try {
    console.log("Processing file:", file.path);

    // 1️⃣ Transcribe audio
    const transcription = await transcribeAudio(file.path);
    if (!transcription) {
      await fs.unlink(file.path).catch(() => {});
      return sendResponse(res, 500, "Failed to transcribe audio");
    }

    // 2️⃣ Detect user language
    const detectedIso = detectLanguage(transcription) || "en";
    const userIso = userLangInput ? userLangInput.split("-")[0] : detectedIso;
    const userNLLB = mapToNLLB(userIso);
    const botNLLB = mapToNLLB("en");

    // 3️⃣ Translate user text to bot language
    const textForBot = await safeTranslate(transcription, userNLLB, botNLLB);

   // 4️⃣ Generate chatbot reply
let botReply = await generateReply(textForBot);

// Ensure botReply is never null
botReply = botReply || "Hello, this is a fallback reply.";

// 5️⃣ Translate bot reply back to user language
const botReplyTranslated = await safeTranslate(botReply, botNLLB, userNLLB);

    // 6️⃣ Cleanup uploaded file
    await fs.unlink(file.path).catch(() => {});

    // 7️⃣ Send final response
    return sendResponse(res, 200, "Success", {
      transcription,
      detectedLanguage: userIso,
      botReplyOriginal: botReply,
      botReplyTranslated,
    });
  } catch (err: any) {
    console.error("audioToChat error:", err);
    await fs.unlink(file.path).catch(() => {});
    return sendResponse(res, 500, "Audio -> Chat failed", err?.message || String(err));
  }
};
