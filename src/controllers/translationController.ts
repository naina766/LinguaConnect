import { Request, Response } from "express";
import { sendResponse } from "../utils/responseHandler";
import { translateText, detectLanguage } from "../services/translateService";

export const translate = async (req: Request, res: Response) => {
  try {
    const { text, targetLang } = req.body;
    if (!text || !targetLang) return sendResponse(res, 400, "text and targetLang required");

    const srcLang = detectLanguage(text);
    const translated = await translateText(text, srcLang, targetLang);

    sendResponse(res, 200, "OK", translated);
  } catch (e: any) {
    sendResponse(res, 500, "Translation failed", { error: e.message });
  }
};

export const detect = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) return sendResponse(res, 400, "text required");

    const lang = detectLanguage(text);
    sendResponse(res, 200, "OK", { lang });
  } catch (e: any) {
    sendResponse(res, 500, "Detect failed", { error: e.message });
  }
};
