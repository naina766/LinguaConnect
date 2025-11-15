import axios from "axios";
import { pipeline } from "@xenova/transformers";

export interface BotResponse {
  reply?: string;
  text?: string;
  output?: string;
}

// Initialize T5 model for fallback
let t5Pipeline: any = null;
const initT5 = async () => {
  if (!t5Pipeline) {
    t5Pipeline = await pipeline("text2text-generation", "Xenova/t5-small");
  }
};

export const queryLingoModel = async (
  text: string,
  conversationId?: string
): Promise<BotResponse> => {
  const url = process.env.CHATBOT_API_URL;

  // 1️⃣ Try primary chatbot API
  if (url) {
    try {
      const res = await axios.post(url, { question: text, conversationId });
      console.log("RAW CHATBOT RESPONSE:", res.data);

      const data = res.data?.data ?? res.data;

      const finalReply =
        data?.reply ??
        data?.text ??
        data?.message ??
        data?.response ??
        data?.answer ??
        data?.output ??
        data?.outputText ??
        data?.botResponse ??
        data?.choices?.[0]?.text ??
        undefined;

      if (finalReply) return { reply: finalReply };
    } catch (err: any) {
      console.error("Primary chatbot API failed:", err.response?.data || err.message || err);
      // Fall through to fallback
    }
  } else {
    console.warn("CHATBOT_API_URL not defined, using fallback model.");
  }

  // 2️⃣ Fallback to T5-small (free local model)
  try {
    await initT5();

    const t5Result = await t5Pipeline(text, { max_new_tokens: 100 });
    const fallbackReply = t5Result?.[0]?.generated_text || "Sorry, I couldn't generate a reply.";

    console.log("Fallback model reply:", fallbackReply);
    return { reply: fallbackReply };
  } catch (err: any) {
    console.error("Fallback model failed:", err);
    return { reply: "Sorry, I couldn't generate a reply." };
  }
};
