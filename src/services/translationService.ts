// import axios from "axios";

// interface TranslationResponse {
//   translated?: string;
// }

// /**
//  * Translate text between NLLB languages
//  */
// export const translateText = async (
//   text: string,
//   sourceLang: string,
//   targetLang: string
// ): Promise<TranslationResponse> => {
//   try {
//     const url = process.env.TRANSLATION_API_URL;
//     const apiKey = process.env.TRANSLATION_API_KEY;

//     if (!url) throw new Error("TRANSLATION_API_URL not defined");

//     const res = await axios.post(
//       url,
//       { text, sourceLang, targetLang },
//       { headers: { "Authorization": `Bearer ${apiKey}` } }
//     );

//     return { translated: res.data?.translated || text };
//   } catch (err: any) {
//     console.error("Translation failed:", err.response?.data || err.message);
//     return { translated: text }; // fallback to original text
//   }
// };
import { pipeline } from "@xenova/transformers";

let translator: any = null;
const initTranslator = async () => {
  if (!translator) {
    translator = await pipeline("translation", "facebook/nllb-200-distilled-600M");
  }
};

export const translateText = async (text: string, sourceLang: string, targetLang: string) => {
  await initTranslator();
  const result = await translator(text, { srcLang: sourceLang, tgtLang: targetLang });
  return { translated: result?.text || text };
};
