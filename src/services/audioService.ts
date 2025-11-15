// src/services/audioService.ts
import fs from "fs";
import Groq from "groq-sdk";

const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
if (!process.env.GROQ_API_KEY) throw new Error("❌ Missing GROQ_API_KEY in .env");

const WHISPER_MODEL = "whisper-large-v3"; // Groq STT model

/**
 * Transcribes audio file using Groq Whisper
 * Returns a string, or null if transcription fails
 */
export const transcribeAudio = async (filePath: string): Promise<string | null> => {
  try {
    const response = await groqClient.audio.transcriptions.create({
      model: WHISPER_MODEL,
      file: fs.createReadStream(filePath), // ✅ ReadStream satisfies Uploadable
    });

    return response.text?.trim() || null;
  } catch (err: any) {
    console.error("❌ Groq Whisper transcription error:", err);
    return null;
  }
};
