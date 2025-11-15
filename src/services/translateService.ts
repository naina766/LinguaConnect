// src/services/translateService.ts
import fetch from "node-fetch";

const HF_API_KEY = process.env.HF_API_KEY;

// Model URL for API inference
const HF_MODEL = "Helsinki-NLP/opus-mt-en-fr"; // adjust for target language
const HF_URL = `https://router.huggingface.co/hf-inference/${HF_MODEL}`;

export const translateText = async (
  text: string,
  sourceLang?: string,
  targetLang: string = "fr"
): Promise<{ translated: string }> => {
  if (!HF_API_KEY) throw new Error("Missing Hugging Face API key in .env");

  const payload = { inputs: text };

  try {
    const res = await fetch(HF_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await res.json();

    if (Array.isArray(result) && result[0]?.translation_text) {
      return { translated: result[0].translation_text };
    } else if (result.error) {
      throw new Error(result.error);
    } else {
      throw new Error("Unexpected response from Hugging Face API");
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("translateText error:", message);
    throw new Error(message);
  }
};

// simple language detector
export const detectLanguage = (text: string): string => {
  const pattern = /[^\x00-\x7F]+/;
  return pattern.test(text) ? "hi" : "en";
};

// NLLB mapping (can stay)
export const mapToNLLB = (iso: string): string => {
  const map: Record<string, string> = {
    en: "eng_Latn",
    hi: "hin_Deva",
    fr: "fra_Latn",
    es: "spa_Latn",
  };
  return map[iso] || "eng_Latn";
};
