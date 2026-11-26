import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("Gemini API key is not configured.");
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { apiVersion: "v1alpha" }
    });

    const token = await ai.authTokens.create({
      config: {
        uses: 1,
        liveConnectConstraints: {
          model: "gemini-2.5-flash-native-audio-preview-12-2025"
        },
        httpOptions: { apiVersion: "v1alpha" }
      }
    });

    if (!token.name) {
      throw new Error("Gemini did not return a token.");
    }

    return res.status(200).json({
      token: token.name
    });

  } catch (error) {
    console.error("Token generation failed:", error.message);

    return res.status(500).json({
      error: "Unable to create a Gemini session."
    });
  }
}