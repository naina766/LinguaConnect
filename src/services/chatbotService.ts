import Groq from "groq-sdk";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

if (!process.env.GROQ_API_KEY) throw new Error("❌ Missing GROQ_API_KEY in .env");

export const generateReply = async (question: string) => {
  try {
    const chatCompletion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile", // ✅ Changed to supported model
      messages: [
        { role: "system", content: "You are a helpful customer support chatbot." },
        { role: "user", content: question },
      ],
      temperature: 0.7,
      max_completion_tokens: 200,
      // omit max_tokens if not supported; check docs for exact param name
    });

    return chatCompletion.choices[0].message.content;
  } catch (err: any) {
    console.error("❌ Error generating reply via Groq:", err);
    throw new Error("Chatbot failed to generate reply. Check server logs.");
  }
};
