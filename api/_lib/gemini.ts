import { randomUUID } from "node:crypto";
import {
  ApiError,
  GoogleGenAI,
  ThinkingLevel,
  type GenerateContentConfig,
  type GenerateContentResponse,
} from "@google/genai";
import { z } from "zod";
import {
  GenerateScriptRequestSchema,
  GenerateScriptResponseSchema,
  LLMScriptPayloadSchema,
  VideoProjectSchema,
  type AspectRatio,
  type GenerateScriptRequest,
  type GenerateScriptResponse,
  type LLMScriptPayload,
  type LanguageCode,
  type Scene,
  type ThemeId,
  type VideoProject,
} from "../../src/remotion/types.ts";

export const DEFAULT_GEMINI_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.6-flash",
  "gemini-3-flash-preview",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemma-4-31b-it",
] as const;

const OVERALL_DEADLINE_MS = 80_000;
const PER_CALL_TIMEOUT_MS = 16_000;
const MIN_CALL_BUDGET_MS = 350;
const VIDEO_FPS = 30;
const DEFAULT_SCENE_DURATION_FRAMES = 150;

const HEX_COLOR_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const THEME_DEFAULT_ACCENTS: Record<ThemeId, string> = {
  cyber_dark: "#06B6D4",
  clean_modern: "#2563EB",
  sunset_amber: "#F59E0B",
  emerald_nature: "#10B981",
};

const LANGUAGE_DIRECTIONS: Record<LanguageCode, string> = {
  "en-IN":
    "Use clear, engaging Indian English (en-IN) suitable for students and tech-literate viewers across India. All headings, subtext, bulletPoints, highlightWord, and narrationScript MUST be in natural English.",
  "hi-IN":
    "Use natural, conversational Hindi written strictly in Devanagari script (हिन्दी देवनागरी लिपि, e.g. 'प्रकाश संश्लेषण कैसे काम करता है'). All headings, subtext, bulletPoints, highlightWord, and narrationScript MUST be in Devanagari Hindi (only scientific units/symbols like ATP, CO2, V = I × R may stay in standard notation; keep JSON keys, type, iconName, and accentColor in ASCII).",
  "gu-IN":
    "Use natural, conversational Gujarati written strictly in Gujarati script (ગુજરાતી લિપિ, e.g. 'ઓહ્મનો નિયમ કેવી રીતે કામ કરે છે'). All headings, subtext, bulletPoints, highlightWord, and narrationScript MUST be in Gujarati script (only scientific units/symbols like V = I × R, CO2 may stay in standard notation; keep JSON keys, type, iconName, and accentColor in ASCII).",
  "en-US":
    "Use clear, engaging American English (en-US). All headings, subtext, bulletPoints, highlightWord, and narrationScript MUST be in natural English.",
};

const CURATED_LUCIDE_ICONS = [
  "Sparkles",
  "Atom",
  "Binary",
  "BookOpen",
  "Bot",
  "Brain",
  "Calculator",
  "CheckCircle2",
  "Clock",
  "Cloud",
  "Code2",
  "Compass",
  "Cpu",
  "Database",
  "Dna",
  "Eye",
  "Flame",
  "FlaskConical",
  "Gauge",
  "Globe",
  "GraduationCap",
  "HardDrive",
  "HeartPulse",
  "Infinity",
  "Key",
  "Layers",
  "Leaf",
  "Lightbulb",
  "Link",
  "Lock",
  "Magnet",
  "Map",
  "Microscope",
  "Network",
  "Orbit",
  "Percent",
  "PieChart",
  "Plug",
  "Radar",
  "Recycle",
  "RefreshCw",
  "Rocket",
  "Scale",
  "Search",
  "Server",
  "Settings",
  "ShieldCheck",
  "Sigma",
  "Smartphone",
  "Sprout",
  "Star",
  "Sun",
  "Target",
  "Terminal",
  "Thermometer",
  "TrendingUp",
  "Users",
  "Waves",
  "Wifi",
  "Workflow",
  "Wrench",
  "Zap",
].join(", ");

const LLM_SCRIPT_JSON_SCHEMA = z.toJSONSchema(LLMScriptPayloadSchema);
const LLM_SCRIPT_JSON_SCHEMA_TEXT = JSON.stringify(LLM_SCRIPT_JSON_SCHEMA, null, 2);

const SYSTEM_PROMPT = `You are the Script Director for "VidyaMotion AI", an educational animated explainer video studio.
Given a topic, target language, visual theme, and aspect ratio, break down the concept into 3 to 6 engaging, bite-sized visual scenes (4 or 5 scenes is ideal).

STRICT SCENE ARCHITECTURE RULES:
1. Return ONLY a JSON object matching the schema: { "scenes": [ ... ] } with 3 to 6 scenes.
2. Scene 1 (first scene) MUST use type "TITLE_HERO" with a compelling hook heading, short subtext, and optional highlightWord topic tag.
3. Middle scenes MUST choose the best educational templates from:
   - "SPLIT_EXPLAINER": concept visual + 3 concise bulletPoints (max 4, <= 100 chars each).
   - "KEY_METRIC_OR_FACT": centered formula, statistic, or key definition in highlightWord (<= 30 chars, e.g. "V = I × R", "99.9%", "O(log n)") + crisp heading + explanatory subtext.
   - "STEP_BY_STEP_FLOW": 3 sequential steps in bulletPoints formatted as "Phase: short action" (e.g. "Input: Photons strike silicon", "Process: Electrons flow as DC", "Output: Inverter powers grid").
4. Final scene (last scene) MUST use type "SUMMARY_TAKEAWAY" with 3 concise recap items in bulletPoints and an optional highlightWord badge.
5. HARD CHARACTER LIMITS (never exceed these):
   - heading: <= 80 characters (concise, high-impact title)
   - subtext: <= 160 characters (optional)
   - bulletPoints: array of 0 to 4 strings, each <= 100 characters
   - highlightWord: <= 30 characters (optional)
   - iconName: MUST be a PascalCase Lucide icon identifier from this curated list: ${CURATED_LUCIDE_ICONS}
   - accentColor: MUST be a valid 6-digit hex color like "#06B6D4", "#38BDF8", "#8B5CF6", "#10B981", "#F59E0B", or "#2563EB".
6. NARRATION RULES:
   - Every scene MUST have a rich, conversational, human-sounding "narrationScript" (2 to 3 clear sentences, ~25-45 words) tailored for text-to-speech voiceover.
   - Make narrationScript TTS-friendly: NO markdown symbols (*, #, \`\`), NO URLs, NO emojis, NO bullet symbols.
   - Strictly match the requested language and script.`;

export interface GenerateScriptOptions {
  apiKeys?: readonly string[];
  models?: readonly string[];
  overallDeadlineMs?: number;
  perCallTimeoutMs?: number;
}

export class ScriptGenerationError extends Error {
  readonly code = "ALL_PROVIDERS_FAILED" as const;
  readonly statusCode = 503;
  readonly attemptsSummary: readonly string[];

  constructor(message: string, attemptsSummary: readonly string[] = []) {
    super(message);
    this.name = "ScriptGenerationError";
    this.attemptsSummary = attemptsSummary;
  }
}

interface ConfigOverrides {
  omitThinking?: boolean;
  thinkingLevelOverride?: ThinkingLevel;
  omitJsonMode?: boolean;
  omitSystemInstruction?: boolean;
}

type ProviderErrorClassification =
  | { kind: "dead_key"; status?: number; reason: string }
  | { kind: "rate_limit"; status: 429; reason: string }
  | {
      kind: "unsupported_param";
      status: 400;
      reason: string;
      thinkingUnsupported: boolean;
      jsonModeUnsupported: boolean;
      systemInstructionUnsupported: boolean;
    }
  | { kind: "model_unavailable"; status?: number; reason: string };

/**
 * Reads GEMINI_API_KEY followed by numerically sorted GEMINI_API_KEY_BACKUP_<N> variables,
 * ignoring empty/missing entries and preserving deduplicated priority order.
 */
export function getConfiguredGeminiKeys(
  env: Record<string, string | undefined> = process.env
): string[] {
  const keys: string[] = [];
  const seen = new Set<string>();

  const pushKey = (raw: string | undefined) => {
    const trimmed = raw?.trim();
    if (!trimmed || seen.has(trimmed)) {
      return;
    }
    seen.add(trimmed);
    keys.push(trimmed);
  };

  pushKey(env.GEMINI_API_KEY);

  const backupEntries: Array<{ index: number; value: string | undefined }> = [];
  for (const [envName, envValue] of Object.entries(env)) {
    const match = /^GEMINI_API_KEY_BACKUP_(\d+)$/.exec(envName);
    if (!match) {
      continue;
    }
    const index = Number.parseInt(match[1], 10);
    if (Number.isFinite(index) && index >= 1) {
      backupEntries.push({ index, value: envValue });
    }
  }

  backupEntries.sort((a, b) => a.index - b.index);
  for (const entry of backupEntries) {
    pushKey(entry.value);
  }

  return keys;
}

/**
 * Parses comma-separated GEMINI_MODELS preserving exact user priority order,
 * falling back to DEFAULT_GEMINI_MODELS when missing or empty.
 */
export function getConfiguredGeminiModels(
  env: Record<string, string | undefined> = process.env
): string[] {
  const raw = env.GEMINI_MODELS?.trim();
  if (!raw) {
    return [...DEFAULT_GEMINI_MODELS];
  }

  const models: string[] = [];
  const seen = new Set<string>();
  for (const token of raw.split(",")) {
    const cleaned = token.trim();
    if (!cleaned || seen.has(cleaned)) {
      continue;
    }
    seen.add(cleaned);
    models.push(cleaned);
  }

  return models.length > 0 ? models : [...DEFAULT_GEMINI_MODELS];
}

function isGemmaModel(model: string): boolean {
  return model.trim().toLowerCase().startsWith("gemma-");
}

function getThinkingLevelForModel(model: string): ThinkingLevel {
  const normalized = model.trim().toLowerCase();
  if (normalized.startsWith("gemini-3.8-")) {
    return ThinkingLevel.LOW;
  }
  return ThinkingLevel.MINIMAL;
}

function buildUserPrompt(
  input: GenerateScriptRequest,
  options?: {
    includeContract?: boolean;
    validationFeedback?: string;
    previousResponseSnippet?: string;
  }
): string {
  const languageRule = LANGUAGE_DIRECTIONS[input.language];
  const accentHint = THEME_DEFAULT_ACCENTS[input.theme];
  const aspectHint =
    input.aspectRatio === "9:16"
      ? "9:16 vertical portrait (Shorts/Reels) — keep headings and bullet points extra punchy."
      : "16:9 widescreen landscape (YouTube/Classroom).";

  const sections: string[] = [];

  if (options?.includeContract) {
    sections.push(
      SYSTEM_PROMPT,
      `OUTPUT JSON SCHEMA CONTRACT:\n${LLM_SCRIPT_JSON_SCHEMA_TEXT}`,
      `CRITICAL OUTPUT FORMAT: Respond with ONLY a valid raw JSON object matching the schema above. Do NOT include markdown code fences, commentary, or extra keys.`
    );
  }

  sections.push(
    [
      `TOPIC: ${input.topic}`,
      `TARGET LANGUAGE: ${input.language}`,
      `LANGUAGE & SCRIPT REQUIREMENT: ${languageRule}`,
      `VISUAL THEME: ${input.theme} (suggested primary accentColor: ${accentHint})`,
      `ASPECT RATIO: ${aspectHint}`,
      `Generate 3 to 6 scenes starting with TITLE_HERO and ending with SUMMARY_TAKEAWAY.`,
    ].join("\n")
  );

  if (options?.validationFeedback) {
    sections.push(
      [
        `PREVIOUS OUTPUT FAILED VALIDATION. Fix every issue below and return ONLY valid JSON matching the schema:`,
        options.validationFeedback,
        options.previousResponseSnippet
          ? `Previous invalid JSON excerpt:\n${options.previousResponseSnippet}`
          : "",
      ]
        .filter(Boolean)
        .join("\n")
    );
  }

  return sections.join("\n\n");
}

function buildModelConfig(
  model: string,
  overrides: ConfigOverrides = {}
): { config: GenerateContentConfig; includeContractInPrompt: boolean } {
  const gemma = isGemmaModel(model);
  const omitSystem = gemma || Boolean(overrides.omitSystemInstruction);
  const omitJson = gemma || Boolean(overrides.omitJsonMode);

  const config: GenerateContentConfig = {
    temperature: 0.3,
  };

  if (!overrides.omitThinking) {
    config.thinkingConfig = {
      thinkingLevel:
        overrides.thinkingLevelOverride ?? getThinkingLevelForModel(model),
    };
  }

  if (!omitSystem) {
    config.systemInstruction = SYSTEM_PROMPT;
  }

  if (!omitJson) {
    config.responseMimeType = "application/json";
    config.responseJsonSchema = LLM_SCRIPT_JSON_SCHEMA;
  }

  return {
    config,
    includeContractInPrompt: omitSystem || omitJson,
  };
}

function redactSecrets(text: string, secrets: readonly string[]): string {
  let sanitized = text;
  for (const secret of secrets) {
    if (secret.length >= 6 && sanitized.includes(secret)) {
      sanitized = sanitized.split(secret).join("[REDACTED]");
    }
  }
  return sanitized.replace(/AIza[0-9A-Za-z_-]{16,}/g, "[REDACTED_KEY]");
}

function extractApiErrorInfo(error: unknown): {
  status?: number;
  apiStatus?: string;
  reasons: string[];
  message: string;
} {
  const rawMessage = error instanceof Error ? error.message : String(error);
  let status =
    error instanceof ApiError
      ? error.status
      : typeof (error as { status?: unknown })?.status === "number"
        ? ((error as { status: number }).status as number)
        : undefined;

  let apiStatus = "";
  let extractedMessage = rawMessage;
  const reasons: string[] = [];

  const trimmed = rawMessage.trim();
  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed) as {
        error?: {
          code?: unknown;
          message?: unknown;
          status?: unknown;
          details?: Array<{ reason?: unknown }>;
        };
      };
      const errObj = parsed?.error;
      if (errObj) {
        if (typeof errObj.code === "number" && status === undefined) {
          status = errObj.code;
        }
        if (typeof errObj.status === "string") {
          apiStatus = errObj.status;
        }
        if (typeof errObj.message === "string") {
          extractedMessage = errObj.message;
        }
        if (Array.isArray(errObj.details)) {
          for (const detail of errObj.details) {
            if (typeof detail?.reason === "string") {
              reasons.push(detail.reason);
            }
          }
        }
      }
    } catch {
      // Non-JSON error message; keep rawMessage.
    }
  }

  return {
    status,
    apiStatus,
    reasons,
    message: extractedMessage,
  };
}

function isAbortOrTimeoutError(error: unknown, message: string): boolean {
  if (error instanceof Error && error.name === "AbortError") {
    return true;
  }
  return /aborted|abortError|timed out|timeout|deadline exceeded/i.test(message);
}

function classifyProviderError(
  error: unknown,
  secrets: readonly string[]
): ProviderErrorClassification {
  const { status, apiStatus, reasons, message } = extractApiErrorInfo(error);
  const safeMessage = redactSecrets(message, secrets);

  const hasInvalidKeyReason =
    reasons.includes("API_KEY_INVALID") ||
    reasons.includes("ACCESS_TOKEN_TYPE_UNSUPPORTED") ||
    /API[_\s]?KEY[_\s]?INVALID|API key not valid|invalid api key|API key expired/i.test(
      safeMessage
    );

  if (status === 401 || status === 403) {
    return {
      kind: "dead_key",
      status,
      reason: `HTTP ${status} (${apiStatus || "AUTH_ERROR"})`,
    };
  }

  if (status === 400 && hasInvalidKeyReason) {
    return {
      kind: "dead_key",
      status: 400,
      reason: "HTTP 400 API_KEY_INVALID",
    };
  }

  if (status === 429 || apiStatus === "RESOURCE_EXHAUSTED") {
    return {
      kind: "rate_limit",
      status: 429,
      reason: "HTTP 429 RESOURCE_EXHAUSTED",
    };
  }

  if (status === 400) {
    const thinkingUnsupported = /thinking/i.test(safeMessage);
    const jsonModeUnsupported =
      /json|response_mime_type|responseMimeType|response_schema|response_json_schema|schema/i.test(
        safeMessage
      );
    const systemInstructionUnsupported =
      /system[_\s]?instruction|developer[_\s]?instruction/i.test(safeMessage);

    return {
      kind: "unsupported_param",
      status: 400,
      reason: safeMessage.slice(0, 160),
      thinkingUnsupported,
      jsonModeUnsupported,
      systemInstructionUnsupported,
    };
  }

  if (isAbortOrTimeoutError(error, safeMessage)) {
    return {
      kind: "model_unavailable",
      status,
      reason: status ? `HTTP ${status} timeout` : "Request timeout/AbortError",
    };
  }

  return {
    kind: "model_unavailable",
    status,
    reason: status
      ? `HTTP ${status} ${apiStatus || safeMessage.slice(0, 120)}`
      : safeMessage.slice(0, 140),
  };
}

function extractResponseText(response: GenerateContentResponse): string {
  const parts = response.candidates?.[0]?.content?.parts;
  if (Array.isArray(parts) && parts.length > 0) {
    const nonThoughtText = parts
      .filter((part) => part.thought !== true && typeof part.text === "string")
      .map((part) => part.text ?? "")
      .join("");
    if (nonThoughtText.trim().length > 0) {
      return nonThoughtText;
    }
  }

  return typeof response.text === "string" ? response.text : "";
}

function stripMarkdownFences(raw: string): string {
  const trimmed = raw.trim();
  const fencedMatch = /```(?:json)?\s*([\s\S]*?)```/i.exec(trimmed);
  if (fencedMatch && fencedMatch[1]) {
    return fencedMatch[1].trim();
  }
  return trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function sliceOutermostJson(raw: string): string {
  const text = raw.trim();
  const firstObj = text.indexOf("{");
  const firstArr = text.indexOf("[");

  if (firstObj === -1 && firstArr === -1) {
    return text;
  }

  const openChar =
    firstObj !== -1 && (firstArr === -1 || firstObj < firstArr) ? "{" : "[";
  const closeChar = openChar === "{" ? "}" : "]";
  const start = openChar === "{" ? firstObj : firstArr;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === openChar) {
      depth++;
    } else if (ch === closeChar) {
      depth--;
      if (depth === 0) {
        return text.slice(start, i + 1);
      }
    }
  }

  const lastClose = text.lastIndexOf(closeChar);
  return lastClose > start ? text.slice(start, lastClose + 1) : text.slice(start);
}

function stripNullOptionalFields(raw: unknown): unknown {
  if (Array.isArray(raw)) {
    return { scenes: raw.map(normalizeRawScene) };
  }
  if (typeof raw === "object" && raw !== null && "scenes" in raw) {
    const record = raw as Record<string, unknown>;
    if (Array.isArray(record.scenes)) {
      return {
        ...record,
        scenes: record.scenes.map(normalizeRawScene),
      };
    }
  }
  return raw;
}

function normalizeRawScene(rawScene: unknown): unknown {
  if (typeof rawScene !== "object" || rawScene === null) {
    return rawScene;
  }
  const source = rawScene as Record<string, unknown>;
  const cleaned: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(source)) {
    if (value === null || value === undefined) {
      continue;
    }
    if (
      (key === "subtext" || key === "highlightWord" || key === "id") &&
      typeof value === "string" &&
      value.trim().length === 0
    ) {
      continue;
    }
    if (
      (key === "iconName" || key === "accentColor") &&
      typeof value === "string" &&
      value.trim().length === 0
    ) {
      continue;
    }
    if (key === "bulletPoints" && Array.isArray(value)) {
      const filtered = value.filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0
      );
      if (filtered.length > 0) {
        cleaned[key] = filtered;
      }
      continue;
    }
    cleaned[key] = value;
  }

  return cleaned;
}

function formatValidationError(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues
      .slice(0, 6)
      .map((issue) => {
        const path = issue.path.length > 0 ? issue.path.join(".") : "root";
        return `- ${path}: ${issue.message}`;
      })
      .join("\n");
  }
  if (error instanceof Error) {
    return `- ${error.message}`;
  }
  return "- Invalid JSON response";
}

function parseAndValidateScriptPayload(rawText: string): LLMScriptPayload {
  const unfenced = stripMarkdownFences(rawText);
  const jsonSlice = sliceOutermostJson(unfenced);
  if (!jsonSlice) {
    throw new Error("Model returned empty response text.");
  }
  const parsedJson = JSON.parse(jsonSlice) as unknown;
  const normalized = stripNullOptionalFields(parsedJson);
  return LLMScriptPayloadSchema.parse(normalized);
}

function hydrateVideoProject(
  payload: LLMScriptPayload,
  input: {
    topic: string;
    language: LanguageCode;
    theme: ThemeId;
    aspectRatio: AspectRatio;
  }
): VideoProject {
  const usedIds = new Set<string>();
  const defaultAccent = THEME_DEFAULT_ACCENTS[input.theme];

  const scenes: Scene[] = payload.scenes.map((rawScene, index) => {
    const candidateId = rawScene.id?.trim();
    const baseId =
      candidateId && !usedIds.has(candidateId)
        ? candidateId
        : `scene-${index + 1}`;
    usedIds.add(baseId);

    const accentTrimmed = rawScene.accentColor.trim();
    const accentColor = HEX_COLOR_RE.test(accentTrimmed)
      ? accentTrimmed
      : defaultAccent;

    const bulletPoints = rawScene.bulletPoints
      ?.map((item) => item.trim())
      .filter((item) => item.length > 0);

    return {
      id: baseId,
      type: rawScene.type,
      heading: rawScene.heading.trim(),
      ...(rawScene.subtext?.trim() ? { subtext: rawScene.subtext.trim() } : {}),
      ...(bulletPoints && bulletPoints.length > 0 ? { bulletPoints } : {}),
      ...(rawScene.highlightWord?.trim()
        ? { highlightWord: rawScene.highlightWord.trim() }
        : {}),
      iconName: rawScene.iconName.trim() || "Sparkles",
      narrationScript: rawScene.narrationScript.trim(),
      accentColor,
      durationInFrames: DEFAULT_SCENE_DURATION_FRAMES,
    };
  });

  const totalDurationInFrames = scenes.reduce(
    (sum, scene) => sum + scene.durationInFrames,
    0
  );

  return VideoProjectSchema.parse({
    id: `proj_${randomUUID()}`,
    topic: input.topic,
    language: input.language,
    theme: input.theme,
    aspectRatio: input.aspectRatio,
    fps: VIDEO_FPS,
    scenes,
    totalDurationInFrames,
  });
}

async function invokeModelOnce(params: {
  apiKey: string;
  model: string;
  input: GenerateScriptRequest;
  callTimeoutMs: number;
  overrides?: ConfigOverrides;
  validationFeedback?: string;
  previousResponseSnippet?: string;
}): Promise<string> {
  const ai = new GoogleGenAI({
    apiKey: params.apiKey,
    apiVersion: "v1beta",
    httpOptions: { timeout: params.callTimeoutMs },
  });

  const { config, includeContractInPrompt } = buildModelConfig(
    params.model,
    params.overrides
  );

  const userPrompt = buildUserPrompt(params.input, {
    includeContract: includeContractInPrompt,
    validationFeedback: params.validationFeedback,
    previousResponseSnippet: params.previousResponseSnippet,
  });

  const response = await ai.models.generateContent({
    model: params.model,
    contents: userPrompt,
    config,
  });

  const text = extractResponseText(response);
  if (!text.trim()) {
    const blockReason = response.promptFeedback?.blockReason;
    const finishReason = response.candidates?.[0]?.finishReason;
    throw new Error(
      `Empty response from ${params.model}${
        blockReason ? ` (blockReason=${blockReason})` : ""
      }${finishReason ? ` (finishReason=${finishReason})` : ""}`
    );
  }

  return text;
}

function buildAdaptedOverrides(
  model: string,
  base: ConfigOverrides,
  classification: Extract<ProviderErrorClassification, { kind: "unsupported_param" }>
): ConfigOverrides {
  const next: ConfigOverrides = { ...base };
  let changed = false;

  if (classification.thinkingUnsupported) {
    if (
      !base.omitThinking &&
      getThinkingLevelForModel(model) === ThinkingLevel.MINIMAL &&
      base.thinkingLevelOverride === undefined
    ) {
      next.thinkingLevelOverride = ThinkingLevel.LOW;
    } else {
      next.omitThinking = true;
    }
    changed = true;
  }

  if (classification.jsonModeUnsupported) {
    next.omitJsonMode = true;
    changed = true;
  }

  if (classification.systemInstructionUnsupported) {
    next.omitSystemInstruction = true;
    changed = true;
  }

  if (!changed) {
    next.omitThinking = true;
    next.omitJsonMode = true;
    next.omitSystemInstruction = true;
  }

  return next;
}

/**
 * Generates a Zod-validated VideoProject script using an ordered model + API key
 * fallback chain on Gemini v1beta within an 80s total deadline and 16s per-call cap.
 */
export async function generateScriptWithFallback(
  rawInput: GenerateScriptRequest,
  options: GenerateScriptOptions = {}
): Promise<GenerateScriptResponse> {
  const input = GenerateScriptRequestSchema.parse(rawInput);

  const keys = (
    options.apiKeys ? [...options.apiKeys] : getConfiguredGeminiKeys()
  )
    .map((k) => k.trim())
    .filter((k) => k.length > 0);

  const models = (
    options.models ? [...options.models] : getConfiguredGeminiModels()
  )
    .map((m) => m.trim())
    .filter((m) => m.length > 0);

  if (keys.length === 0) {
    throw new ScriptGenerationError(
      "No Gemini API keys are configured on the server."
    );
  }

  if (models.length === 0) {
    throw new ScriptGenerationError(
      "No Gemini models are configured on the server."
    );
  }

  const overallDeadlineMs = options.overallDeadlineMs ?? OVERALL_DEADLINE_MS;
  const perCallTimeoutMs = options.perCallTimeoutMs ?? PER_CALL_TIMEOUT_MS;
  const deadlineAt = Date.now() + overallDeadlineMs;

  const deadKeys = new Set<number>();
  const attemptsSummary: string[] = [];

  for (let modelIndex = 0; modelIndex < models.length; modelIndex++) {
    const model = models[modelIndex];

    if (deadKeys.size >= keys.length) {
      break;
    }

    if (deadlineAt - Date.now() <= MIN_CALL_BUDGET_MS) {
      attemptsSummary.push(`deadline_exhausted_before:${model}`);
      break;
    }

    for (let keyIndex = 0; keyIndex < keys.length; keyIndex++) {
      if (deadKeys.has(keyIndex)) {
        continue;
      }

      const remainingMs = deadlineAt - Date.now();
      if (remainingMs <= MIN_CALL_BUDGET_MS) {
        attemptsSummary.push(`deadline_exhausted:${model}`);
        break;
      }

      const apiKey = keys[keyIndex];
      const keyLabel = `key#${keyIndex + 1}`;
      let activeOverrides: ConfigOverrides = {};
      let rawText: string | undefined;

      try {
        rawText = await invokeModelOnce({
          apiKey,
          model,
          input,
          callTimeoutMs: Math.min(perCallTimeoutMs, remainingMs),
          overrides: activeOverrides,
        });
      } catch (error) {
        const classified = classifyProviderError(error, keys);

        if (classified.kind === "dead_key") {
          deadKeys.add(keyIndex);
          attemptsSummary.push(`${model}/${keyLabel}:${classified.reason}`);
          console.warn(
            `[gemini] Marking ${keyLabel} dead (${classified.reason}) on ${model}; trying next key.`
          );
          continue;
        }

        if (classified.kind === "rate_limit") {
          attemptsSummary.push(`${model}/${keyLabel}:429`);
          console.warn(
            `[gemini] Quota limit (429) for ${model} on ${keyLabel}; rotating to next key.`
          );
          continue;
        }

        if (classified.kind === "unsupported_param") {
          const retryRemainingMs = deadlineAt - Date.now();
          if (retryRemainingMs <= MIN_CALL_BUDGET_MS) {
            attemptsSummary.push(`${model}/${keyLabel}:400_deadline`);
            break;
          }

          activeOverrides = buildAdaptedOverrides(
            model,
            activeOverrides,
            classified
          );
          console.warn(
            `[gemini] Adapting 400 param configuration for ${model} (${classified.reason}) and retrying once.`
          );

          try {
            rawText = await invokeModelOnce({
              apiKey,
              model,
              input,
              callTimeoutMs: Math.min(perCallTimeoutMs, retryRemainingMs),
              overrides: activeOverrides,
            });
          } catch (retryError) {
            const retryClassified = classifyProviderError(retryError, keys);
            if (retryClassified.kind === "dead_key") {
              deadKeys.add(keyIndex);
              attemptsSummary.push(
                `${model}/${keyLabel}:${retryClassified.reason}`
              );
              continue;
            }
            if (retryClassified.kind === "rate_limit") {
              attemptsSummary.push(`${model}/${keyLabel}:429`);
              continue;
            }
            attemptsSummary.push(
              `${model}/${keyLabel}:${retryClassified.reason}`
            );
            console.warn(
              `[gemini] Adapted 400 retry failed on ${model} (${retryClassified.reason}); advancing to next model.`
            );
            break;
          }
        } else {
          attemptsSummary.push(`${model}/${keyLabel}:${classified.reason}`);
          console.warn(
            `[gemini] Model ${model} unavailable on ${keyLabel} (${classified.reason}); advancing immediately to next model.`
          );
          break;
        }
      }

      if (rawText === undefined) {
        continue;
      }

      // Parse & Zod-validate, with one self-correction retry on the same model/key.
      let payload: LLMScriptPayload | undefined;
      try {
        payload = parseAndValidateScriptPayload(rawText);
      } catch (parseError) {
        const feedback = formatValidationError(parseError);
        const retryRemainingMs = deadlineAt - Date.now();
        if (retryRemainingMs <= MIN_CALL_BUDGET_MS) {
          attemptsSummary.push(`${model}/${keyLabel}:zod_deadline`);
          break;
        }

        console.warn(
          `[gemini] Output validation failed on ${model} (${keyLabel}); retrying once with Zod error feedback.`
        );

        let retryText: string;
        try {
          retryText = await invokeModelOnce({
            apiKey,
            model,
            input,
            callTimeoutMs: Math.min(perCallTimeoutMs, retryRemainingMs),
            overrides: activeOverrides,
            validationFeedback: feedback,
            previousResponseSnippet: redactSecrets(rawText.slice(0, 600), keys),
          });
        } catch (retryError) {
          const retryClassified = classifyProviderError(retryError, keys);
          if (retryClassified.kind === "dead_key") {
            deadKeys.add(keyIndex);
            attemptsSummary.push(
              `${model}/${keyLabel}:${retryClassified.reason}`
            );
            continue;
          }
          if (retryClassified.kind === "rate_limit") {
            attemptsSummary.push(`${model}/${keyLabel}:429`);
            continue;
          }
          attemptsSummary.push(
            `${model}/${keyLabel}:${retryClassified.reason}`
          );
          console.warn(
            `[gemini] Self-correction call failed on ${model} (${retryClassified.reason}); advancing to next model.`
          );
          break;
        }

        try {
          payload = parseAndValidateScriptPayload(retryText);
        } catch (secondParseError) {
          attemptsSummary.push(
            `${model}/${keyLabel}:repeated_validation_failure`
          );
          console.warn(
            `[gemini] Repeated JSON/Zod validation failure on ${model}: ${formatValidationError(
              secondParseError
            )}; advancing immediately to next model.`
          );
          break;
        }
      }

      if (payload === undefined) {
        continue;
      }

      const project = hydrateVideoProject(payload, input);
      const fallbackUsed = modelIndex > 0 || keyIndex > 0;

      console.info(
        `[gemini] Script generated successfully with model=${model} (${keyLabel}, fallbackUsed=${fallbackUsed}, scenes=${project.scenes.length}).`
      );

      return GenerateScriptResponseSchema.parse({
        project,
        modelUsed: model,
        fallbackUsed,
      });
    }
  }

  console.error(
    `[gemini] All providers failed after ${attemptsSummary.length} transition(s): ${attemptsSummary.join(
      " | "
    )}`
  );

  throw new ScriptGenerationError(
    "All Gemini AI script generation models and keys are currently unavailable or exceeded quota. Please try again shortly or load an offline Expo showcase demo.",
    attemptsSummary
  );
}
