import {
  GenerateScriptRequestSchema,
  GenerateScriptResponseSchema,
} from "../src/remotion/types.ts";
import {
  generateScriptWithFallback,
  ScriptGenerationError,
} from "./_lib/gemini.ts";

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
 * POST /api/generate-script
 * Generates a structured VidyaMotion VideoProject script using the Gemini v1beta
 * model + key fallback chain and strict Zod validation.
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

  const parsed = GenerateScriptRequestSchema.safeParse(rawBody);
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
    const result = await generateScriptWithFallback(parsed.data);
    const validated = GenerateScriptResponseSchema.parse(result);
    return jsonResponse(validated, 200);
  } catch (error) {
    if (error instanceof ScriptGenerationError) {
      return jsonResponse(
        {
          error: error.message,
          code: error.code,
        },
        error.statusCode
      );
    }

    console.error("[generate-script] Unexpected script generation error:", error);
    return jsonResponse(
      {
        error:
          "All Gemini AI providers failed while generating the script. Please try again or use an offline demo.",
        code: "ALL_PROVIDERS_FAILED",
      },
      503
    );
  }
}
