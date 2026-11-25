import { GoogleGenAI } from "@google/genai";

export default async (request) => {
  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("Gemini API key is not configured on the server.");
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
      throw new Error("Gemini did not return an authentication token.");
    }

    return new Response(
      JSON.stringify({ token: token.name }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store"
        }
      }
    );

  } catch (error) {
    console.error("Token generation failed:", error.message);

    return new Response(
      JSON.stringify({ error: "Unable to create a Gemini session." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};