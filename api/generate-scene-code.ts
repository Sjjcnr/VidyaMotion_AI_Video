import {
  GenerateSceneCodeRequestSchema,
  GenerateSceneCodeResponseSchema,
} from "../src/remotion/types.ts";
import {
  generateSceneCodeWithFallback,
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
 * POST /api/generate-scene-code
 * Generates a self-contained Remotion TSX component for a single scene in parallel.
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

  const parsed = GenerateSceneCodeRequestSchema.safeParse(rawBody);
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
    const result = await generateSceneCodeWithFallback(parsed.data);
    const validated = GenerateSceneCodeResponseSchema.parse(result);
    return jsonResponse(validated, 200);
  } catch (error) {
    if (error instanceof ScriptGenerationError) {
      return jsonResponse(
        {
          error: error.message,
          code: error.code,
          attempts: error.attemptsSummary,
        },
        error.statusCode
      );
    }

    console.error("[generate-scene-code] Unexpected error:", error);
    return jsonResponse(
      {
        error:
          "All Gemini AI providers failed while generating scene code. Please try again or load an offline demo.",
        code: "ALL_PROVIDERS_FAILED",
      },
      503
    );
  }
}
