import { Request, Response } from "express";
import axios from "axios";
import fs from "fs";
import FormData from "form-data";

const GLADIA_API_KEY = process.env.GLADIA_API_KEY || "61b9019c-47f7-4943-8ec2-8f6810b34709";
const GLADIA_URL = "https://api.gladia.io/v2/transcription";

/**
 * POST /api/transcribe
 * Multipart form upload: audio file + optional language
 */
export const transcribeAudio = async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "Audio file required" });

    const form = new FormData();
    form.append("audio", fs.createReadStream(req.file.path));
    if (req.body.language) form.append("language", req.body.language); // e.g., "hi-IN"

    const response = await axios.post(GLADIA_URL, form, {
      headers: {
        "x-gladia-key": GLADIA_API_KEY,
        ...form.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.status(200).json({ success: true, transcription: response.data });
  } catch (err: any) {
    console.error("Transcription error:", err.message || err);
    res.status(500).json({ success: false, message: "Transcription failed", error: err.message });
  }
};
