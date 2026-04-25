import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

// ─── OpenAI Provider Setup ────────────────────────────────────────────────
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "",
});

// ─── Language Instructions ────────────────────────────────────────────────
const LANG_INSTRUCTIONS: Record<string, string> = {
  hi: "\n\nThe user prefers Hindi. Please respond in Hindi (Devanagari script) unless they write in English.",
  kn: "\n\nThe user prefers Kannada. Please respond in Kannada (ಕನ್ನಡ script) unless they write in English.",
  te: "\n\nThe user prefers Telugu. Please respond in Telugu (తెలుగు script) unless they write in English.",
  ta: "\n\nThe user prefers Tamil. Please respond in Tamil (தமிழ் script) unless they write in English.",
};

// ─── System Prompt ────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Sahara, an AI-powered legal assistant specializing in Indian law.

You help users understand their legal rights, explain legal concepts, and guide them through legal situations in India.

Guidelines:
- Always respond in a simple and clear way
- Be empathetic and supportive
- Mention relevant laws (IPC, Constitution, RTI, etc.) when useful
- Clearly state that your response is for informational purposes only, not legal advice
- Suggest consulting a qualified lawyer for serious issues
- If it's an emergency, suggest contacting police (100), national emergency (112), or women helpline (1091)
`;

// ─── POST Handler ─────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const { messages, language = "en" } = await req.json();

    // Validate messages
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid request: messages array required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const languageInstruction = LANG_INSTRUCTIONS[language] || "";

    const result = streamText({
      model: openai("gpt-4o-mini"),
      system: SYSTEM_PROMPT + languageInstruction,
      messages,
      maxOutputTokens: 1500, // ✅ FIXED (was maxTokens)
      temperature: 0.7,
    });

    // ✅ FIXED STREAM METHOD (safe + compatible)
    return result.toTextStreamResponse();

  } catch (error) {
    console.error("[/api/chat] Error:", error);

    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}