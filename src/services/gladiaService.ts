import axios from "axios";
import FormData from "form-data";

export const transcribeAudio = async (fileBuffer: Buffer) => {
  try {
    const formData = new FormData();

    // Buffer is supported by form-data directly
    formData.append("audio", fileBuffer, {
      filename: "audio.wav",
      contentType: "audio/wav"
    });

    const response = await axios.post(
      "https://api.gladia.io/v2/transcription",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          "x-gladia-key": process.env.GLADIA_API_KEY!,
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      }
    );

    return response.data;
  } catch (err) {
    console.error("Gladia Error:", err);
    return null;
  }
};
