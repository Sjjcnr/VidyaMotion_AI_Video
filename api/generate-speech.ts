import { GenerateSpeechRequestSchema } from "../src/remotion/types.ts";
import { synthesizeSpeech, TtsError } from "./_lib/tts.ts";

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

/**
 * POST /api/generate-speech
 * Synthesizes narration audio and word-level karaoke captions via Edge-TTS.
 */
export async function POST(request: Request): Promise<Response> {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return jsonResponse(
      {
        error: "Request body must be valid JSON.",
        code: "INVALID_JSON",
      },
      400
    );
  }

  const parsed = GenerateSpeechRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    const fieldPath = firstIssue?.path.join(".") || "body";
    const issueMessage = firstIssue?.message || "Invalid request payload.";
    return jsonResponse(
      {
        error: `Validation failed at "${fieldPath}": ${issueMessage}`,
        code: "INVALID_REQUEST",
      },
      400
    );
  }

  try {
    const result = await synthesizeSpeech({
      text: parsed.data.text,
      language: parsed.data.language,
      voice: parsed.data.voice,
    });

    return jsonResponse(result, 200);
  } catch (error) {
    if (error instanceof TtsError) {
      return jsonResponse(
        {
          error: error.message,
          code: error.code,
        },
        error.statusCode
      );
    }

    console.error("[generate-speech] Unexpected synthesis error:", error);
    return jsonResponse(
      {
        error: "Speech synthesis failed unexpectedly.",
        code: "TTS_SYNTHESIS_FAILED",
      },
      502
    );
  }
}
