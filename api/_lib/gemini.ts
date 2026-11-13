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
  GenerateSceneCodeRequestSchema,
  GenerateSceneCodeResponseSchema,
  GenerateScriptRequestSchema,
  GenerateScriptResponseSchema,
  LLMPlanPayloadSchema,
  VideoProjectPlanSchema,
  type AspectRatio,
  type GenerateSceneCodeRequest,
  type GenerateSceneCodeResponse,
  type GenerateScriptRequest,
  type GenerateScriptResponse,
  type LLMPlanPayload,
  type LanguageCode,
  type PlanScene,
  type ThemeId,
  type VideoProjectPlan,
} from "../../src/remotion/types.ts";

export const THEME_COLOR_TOKENS: Record<
  ThemeId,
  {
    background: string;
    cardBg: string;
    cardBorder: string;
    textPrimary: string;
    textSecondary: string;
    accentDefault: string;
    glow: string;
  }
> = {
  cyber_dark: {
    background: "#0A0E17",
    cardBg: "rgba(16, 24, 39, 0.9)",
    cardBorder: "rgba(30, 58, 138, 0.4)",
    textPrimary: "#F8FAFC",
    textSecondary: "#94A3B8",
    accentDefault: "#06B6D4",
    glow: "rgba(6, 182, 212, 0.35)",
  },
  clean_modern: {
    background: "#F8FAFC",
    cardBg: "rgba(255, 255, 255, 0.95)",
    cardBorder: "rgba(226, 232, 240, 0.9)",
    textPrimary: "#0F172A",
    textSecondary: "#475569",
    accentDefault: "#2563EB",
    glow: "rgba(37, 99, 235, 0.25)",
  },
  sunset_amber: {
    background: "#180C08",
    cardBg: "rgba(36, 18, 12, 0.9)",
    cardBorder: "rgba(180, 83, 9, 0.4)",
    textPrimary: "#FFFBEB",
    textSecondary: "#FDE68A",
    accentDefault: "#F59E0B",
    glow: "rgba(245, 158, 11, 0.35)",
  },
  emerald_nature: {
    background: "#061A12",
    cardBg: "rgba(12, 38, 27, 0.9)",
    cardBorder: "rgba(16, 185, 129, 0.35)",
    textPrimary: "#ECFDF5",
    textSecondary: "#A7F3D0",
    accentDefault: "#10B981",
    glow: "rgba(16, 185, 129, 0.35)",
  },
};

export const STAGE2_SYSTEM_PROMPT = `You are the Principal Creative Technologist and Remotion Code Architect for "VidyaMotion AI".
Your mission is to write high-fidelity, production-grade, self-contained Remotion React TSX code for a single educational video scene.

### ENVIRONMENT & SCOPE:
The code runs in an isolated browser runner inside @remotion/player and is exported directly via @remotion/web-renderer.
Available variables in scope:
- React (standard React hooks: useState, useMemo)
- Remotion (Remotion hooks and primitives: useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill, Sequence)
- Lucide (all Lucide React icons as Lucide.IconName, e.g. <Lucide.Sparkles />, <Lucide.Atom />, <Lucide.Cpu />, <Lucide.Zap />, <Lucide.Sun />, <Lucide.Activity />, <Lucide.Leaf />, <Lucide.CheckCircle />, <Lucide.ArrowRight />, <Lucide.Network />)
- palette: theme colors object { background, cardBg, cardBorder, textPrimary, textSecondary, accentDefault, glow }
- accentColor: hex string (e.g. "#6366F1")
- isPortrait: boolean (true when canvas is 1080x1920 portrait; false when 1920x1080 landscape)
- frame: current frame number (number)
- fps: composition frames per second (30)
- durationInFrames: total frame duration of this scene (number, locked to voiceover length)
- heading: scene heading string
- subtext: scene subtext string (optional)
- narrationScript: voiceover narration string for context

### MANDATORY DESIGN & CODE RULES:
1. RETURN ONLY RAW EXECUTABLE TSX CODE:
   export default function GeneratedScene() { ... }
   DO NOT include import statements (React, Remotion, Lucide are already injected).
   DO NOT wrap with markdown fences (\`\`\`tsx). Return raw executable TSX only.

2. GENERATE AS LONG CODE AS POSSIBLE (MINIMUM 200 TO 450+ LINES):
   Write deep, detailed, comprehensive animation code. Never output brief or truncated stubs.
   Include rich multi-layered SVG vector geometry, labeled nodes, moving particles, dynamic connection paths, and mathematical formulas.

3. STRICT ZERO-PPT / ANTI-SLIDE POLICY:
   ABSOLUTELY NO PowerPoint-style bullet point cards, slide decks, or text-heavy card lists!
   The voiceover already handles the narration!
   The visual canvas MUST be a programmatic motion graphic — an interactive animated diagram, biological/chemical structure, algorithmic tree/graph simulation, physics schematic, or engineering flow.

4. FULL VERTICAL CANVAS UTILIZATION IN 9:16 PORTRAIT (1080x1920):
   - In portrait mode, the screen height is 1920px!
   - NEVER make a small 360px landscape box that leaves the top and bottom empty!
   - Make the central visual diagram TALL: height: isPortrait ? "950px" : "500px". In portrait, use a tall SVG viewBox (e.g. "0 0 800 1100" or "0 0 900 1200") so the graphic fills the vertical space.
   - Stack vertically: Top header (0-280px), tall central diagram/mechanism (280-1450px), live metrics/formula pill (1450-1650px), karaoke subtitles clearance (1650-1920px).

5. DURATION-AGNOSTIC ANIMATION:
   Animations MUST scale relative to 'durationInFrames' or use 'frame' with 'Remotion.spring({ frame, fps })' and 'Remotion.interpolate()'.
   NEVER assume a fixed 150 frames. The voiceover might be 90 frames or 400 frames.

6. STRICT WEB-RENDERER & CANVAS EXPORT COMPATIBILITY:
   The video will be exported to MP4 via @remotion/web-renderer which rasterizes the DOM to an HTML canvas:
   - Use pure inline styles with standard '#hex' and 'rgba()' color values.
   - NEVER use Tailwind v4 'oklch()' or CSS variables.
   - NEVER use 'conic-gradient'. Use SVG <linearGradient> or standard linear-gradient.
   - NEVER use 'backdrop-filter: blur(...)'. Use solid 'rgba(...)' backgrounds.
   - NEVER use CSS @keyframes or external CSS classes. All animations must be driven by 'frame'.
   - Box-shadows must have at most 3 arguments: '0 4px 12px rgba(0,0,0,0.5)'.
   - NEVER use window, document, fetch, XMLHttpRequest, localStorage, setTimeout, setInterval, or eval.`;

export const FEW_SHOT_CODE_EXAMPLES = `// Example: Topic-specific Animated SVG Visual (Photovoltaic Cell & Electron Flow)
export default function GeneratedScene() {
  const frame = Remotion.useCurrentFrame();
  const { fps, width, height } = Remotion.useVideoConfig();
  const isPortrait = height > width;

  const intro = Remotion.spring({ frame, fps, config: { damping: 14 } });
  const photonProgress = (frame % 45) / 45;
  const electronFlow = (frame % 60) / 60;
  const pulse = Math.sin(frame * 0.1) * 4;

  const accent = accentColor || "#6366F1";
  const bgSurface = palette?.cardBg || "rgba(15, 23, 42, 0.9)";
  const borderCol = palette?.cardBorder || "rgba(99, 102, 241, 0.3)";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        justifyContent: "space-between",
        padding: isPortrait ? "60px 48px 300px 48px" : "60px 80px 200px 80px",
        boxSizing: "border-box",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Top Header & Concept Pill */}
      <div style={{ textAlign: "center", marginBottom: isPortrait ? "24px" : "16px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 16px",
            borderRadius: "999px",
            backgroundColor: accent + "22",
            border: "1px solid " + accent + "66",
            color: accent,
            fontSize: isPortrait ? "18px" : "16px",
            fontWeight: 700,
            marginBottom: "12px",
          }}
        >
          <Lucide.Sun size={isPortrait ? 20 : 18} color={accent} />
          <span>PHOTOVOLTAIC PROCESS</span>
        </div>
        <h1
          style={{
            fontSize: isPortrait ? "44px" : "52px",
            fontWeight: 800,
            color: palette?.textPrimary || "#F8FAFC",
            margin: "0 0 8px 0",
            lineHeight: 1.15,
          }}
        >
          {heading}
        </h1>
        {subtext && (
          <p
            style={{
              fontSize: isPortrait ? "22px" : "24px",
              color: palette?.textSecondary || "#94A3B8",
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            {subtext}
          </p>
        )}
      </div>

      {/* Central Large Technical Visual Canvas - Vertically Expanded in Portrait */}
      <div
        style={{
          flex: 1,
          width: "100%",
          maxHeight: isPortrait ? "1050px" : "540px",
          backgroundColor: bgSurface,
          border: "1px solid " + borderCol,
          borderRadius: "28px",
          padding: isPortrait ? "32px 24px" : "28px 40px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transform: "scale(" + intro + ")",
          boxShadow: "0 16px 40px rgba(0,0,0,0.4)",
        }}
      >
        <svg
          viewBox={isPortrait ? "0 0 800 1000" : "0 0 1000 480"}
          style={{ width: "100%", height: "100%" }}
        >
          <defs>
            <linearGradient id="nType" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0.85" />
            </linearGradient>
            <linearGradient id="pType" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818CF8" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.85" />
            </linearGradient>
            <linearGradient id="sunRay" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#EAB308" />
            </linearGradient>
          </defs>

          {/* Sunlight Photon Rays */}
          <line x1="120" y1="30" x2="260" y2={120 + photonProgress * 20} stroke="url(#sunRay)" strokeWidth="4" strokeDasharray="8 6" />
          <line x1="360" y1="20" x2="420" y2={120 + photonProgress * 20} stroke="url(#sunRay)" strokeWidth="4" strokeDasharray="8 6" />
          <line x1="600" y1="30" x2="540" y2={120 + photonProgress * 20} stroke="url(#sunRay)" strokeWidth="4" strokeDasharray="8 6" />
          <circle cx="260" cy={120 + photonProgress * 20} r={6 + pulse * 0.3} fill="#FDE047" />
          <circle cx="420" cy={120 + photonProgress * 20} r={6 + pulse * 0.3} fill="#FDE047" />
          <circle cx="540" cy={120 + photonProgress * 20} r={6 + pulse * 0.3} fill="#FDE047" />

          {/* N-Type Semiconductor Layer */}
          <rect x="60" y="160" width={isPortrait ? "680" : "880"} height="110" rx="14" fill="url(#nType)" stroke="#38BDF8" strokeWidth="2.5" />
          <text x="90" y="225" fill="#FFFFFF" fontSize="22" fontWeight="700">N-Type Silicon Layer (Free Mobile Electrons e⁻)</text>

          {/* P-N Depletion Junction */}
          <line x1="60" y1="270" x2={isPortrait ? "740" : "940"} y2="270" stroke="#FDE047" strokeWidth="4" strokeDasharray="10 8" />
          <text x={isPortrait ? "400" : "500"} y="265" fill="#FDE047" fontSize="16" fontWeight="bold" textAnchor="middle">ELECTRIC FIELD DEPLETION ZONE</text>

          {/* P-Type Semiconductor Layer */}
          <rect x="60" y="270" width={isPortrait ? "680" : "880"} height="110" rx="14" fill="url(#pType)" stroke="#818CF8" strokeWidth="2.5" />
          <text x="90" y="335" fill="#FFFFFF" fontSize="22" fontWeight="700">P-Type Silicon Layer (Electron Holes h⁺)</text>

          {/* Flowing Electrons */}
          <circle cx={140 + electronFlow * (isPortrait ? 520 : 700)} cy="215" r="9" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="2.5" />
          <circle cx={240 + electronFlow * (isPortrait ? 420 : 600)} cy="215" r="9" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="2.5" />

          {/* Circuit Wire Loop & Current Meter */}
          <path
            d={isPortrait ? "M 60 215 L 20 215 L 20 620 L 400 620 L 400 780" : "M 60 215 L 20 215 L 20 420 L 500 420 L 940 420 L 940 325"}
            fill="none"
            stroke="#94A3B8"
            strokeWidth="3.5"
            strokeDasharray="12 8"
          />
          <circle cx={isPortrait ? "400" : "500"} cy={isPortrait ? "620" : "420"} r="34" fill="#0F172A" stroke={accent} strokeWidth="3" />
          <text x={isPortrait ? "400" : "500"} y={isPortrait ? "626" : "426"} fill="#F8FAFC" fontSize="16" fontWeight="bold" textAnchor="middle">
            {(electronFlow * 24.5).toFixed(1)} A
          </text>
        </svg>
      </div>
    </div>
  );
}`;

export const DEFAULT_GEMINI_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.6-flash",
  "gemini-3-flash-preview",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemma-4-31b-it",
] as const;

const OVERALL_DEADLINE_MS = 80_000;
const PER_CALL_TIMEOUT_MS = 18_000;
const MIN_CALL_BUDGET_MS = 350;
const VIDEO_FPS = 30;

const HEX_COLOR_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const THEME_DEFAULT_ACCENTS: Record<ThemeId, string> = {
  cyber_dark: "#06B6D4",
  clean_modern: "#2563EB",
  sunset_amber: "#F59E0B",
  emerald_nature: "#10B981",
};

const LANGUAGE_DIRECTIONS: Record<LanguageCode, string> = {
  "en-IN":
    "Use clear, engaging Indian English (en-IN) suitable for students and viewers across India. All headings, subtext, visualBrief, and narrationScript MUST be in natural English.",
  "hi-IN":
    "Use natural, conversational Hindi written strictly in Devanagari script (हिन्दी देवनागरी लिपि, e.g. 'प्रकाश संश्लेषण कैसे काम करता है'). All headings, subtext, visualBrief, and narrationScript MUST be in Devanagari Hindi (only scientific units/symbols like ATP, CO2, V = I × R may stay in standard notation; keep JSON keys, and accentColor in ASCII).",
  "gu-IN":
    "Use natural, conversational Gujarati written strictly in Gujarati script (ગુજરાતી લિપિ, e.g. 'ઓહ્મનો નિયમ કેવી રીતે કામ કરે છે'). All headings, subtext, visualBrief, and narrationScript MUST be in Gujarati script (only scientific units/symbols like V = I × R, CO2 may stay in standard notation; keep JSON keys, and accentColor in ASCII).",
  "en-US":
    "Use clear, engaging American English (en-US). All headings, subtext, visualBrief, and narrationScript MUST be in natural English.",
};

const LLM_PLAN_JSON_SCHEMA = z.toJSONSchema(LLMPlanPayloadSchema);
const LLM_PLAN_JSON_SCHEMA_TEXT = JSON.stringify(LLM_PLAN_JSON_SCHEMA, null, 2);

const STAGE1_SYSTEM_PROMPT = `You are the Script & Visual Director for "VidyaMotion AI", an educational animated video studio.
Given a topic, target language, visual theme, and aspect ratio, break down the concept into 3 to 6 engaging, bite-sized visual scenes (4 or 5 scenes is ideal).

STRICT SCENE ARCHITECTURE RULES:
1. Return ONLY a JSON object matching the schema: { "scenes": [ ... ] } with 3 to 6 scenes.
2. Scene 1 (first scene) MUST be an opening hook introducing the core question or big idea.
3. Middle scenes MUST explain key mechanisms, steps, or principles.
4. Final scene (last scene) MUST provide a memorable summary or takeaway.
5. MANDATORY FIELDS PER SCENE:
   - heading: <= 120 characters (high-impact title)
   - subtext: <= 250 characters (concise explanation)
   - visualBrief: MANDATORY (concise, highly specific visual design brief describing the topic-specific diagram, flowchart, schematic, chemical equation, or mathematical animation to be coded in Remotion TSX)
   - narrationScript: rich, conversational, human-sounding (2 to 3 clear sentences, ~25-45 words) tailored for text-to-speech voiceover
   - accentColor: valid 6-digit hex color like "#06B6D4", "#38BDF8", "#8B5CF6", "#10B981", "#F59E0B", or "#2563EB"
6. NARRATION & SCRIPT RULES:
   - Make narrationScript TTS-friendly: NO markdown symbols (*, #, \`\`), NO URLs, NO emojis, NO bullet symbols.
   - Strictly match the requested language and script (Devanagari for Hindi, Gujarati script for Gujarati).`;

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

function buildStage1UserPrompt(
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
      ? "9:16 vertical portrait (Shorts/Reels) — keep headings extra punchy."
      : "16:9 widescreen landscape (YouTube/Classroom).";

  const sections: string[] = [];

  if (options?.includeContract) {
    sections.push(
      STAGE1_SYSTEM_PROMPT,
      `OUTPUT JSON SCHEMA CONTRACT:\n${LLM_PLAN_JSON_SCHEMA_TEXT}`,
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
      `Generate 3 to 6 educational scenes with detailed visualBrief entries describing topic-specific diagrams or animations.`,
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

function buildModelConfigForStage1(
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
    config.systemInstruction = STAGE1_SYSTEM_PROMPT;
  }

  if (!omitJson) {
    config.responseMimeType = "application/json";
    config.responseJsonSchema = LLM_PLAN_JSON_SCHEMA;
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
    return { scenes: raw.map(normalizeRawPlanScene) };
  }
  if (typeof raw === "object" && raw !== null && "scenes" in raw) {
    const record = raw as Record<string, unknown>;
    if (Array.isArray(record.scenes)) {
      return {
        ...record,
        scenes: record.scenes.map(normalizeRawPlanScene),
      };
    }
  }
  return raw;
}

function normalizeRawPlanScene(rawScene: unknown): unknown {
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
      (key === "subtext" || key === "id") &&
      typeof value === "string" &&
      value.trim().length === 0
    ) {
      continue;
    }
    if (
      (key === "accentColor" || key === "visualBrief") &&
      typeof value === "string" &&
      value.trim().length === 0
    ) {
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

function parseAndValidatePlanPayload(rawText: string): LLMPlanPayload {
  const unfenced = stripMarkdownFences(rawText);
  const jsonSlice = sliceOutermostJson(unfenced);
  if (!jsonSlice) {
    throw new Error("Model returned empty response text.");
  }
  const parsedJson = JSON.parse(jsonSlice) as unknown;
  const normalized = stripNullOptionalFields(parsedJson);
  return LLMPlanPayloadSchema.parse(normalized);
}

function hydrateVideoProjectPlan(
  payload: LLMPlanPayload,
  input: {
    topic: string;
    language: LanguageCode;
    theme: ThemeId;
    aspectRatio: AspectRatio;
  }
): VideoProjectPlan {
  const usedIds = new Set<string>();
  const defaultAccent = THEME_DEFAULT_ACCENTS[input.theme];

  const scenes: PlanScene[] = payload.scenes.map((rawScene, index) => {
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

    return {
      id: baseId,
      heading: rawScene.heading.trim(),
      ...(rawScene.subtext?.trim() ? { subtext: rawScene.subtext.trim() } : {}),
      visualBrief: rawScene.visualBrief.trim(),
      narrationScript: rawScene.narrationScript.trim(),
      accentColor,
    };
  });

  return VideoProjectPlanSchema.parse({
    id: `proj_${randomUUID()}`,
    topic: input.topic,
    language: input.language,
    theme: input.theme,
    aspectRatio: input.aspectRatio,
    fps: VIDEO_FPS,
    scenes,
  });
}

async function invokeModelForStage1Once(params: {
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

  const { config, includeContractInPrompt } = buildModelConfigForStage1(
    params.model,
    params.overrides
  );

  const userPrompt = buildStage1UserPrompt(params.input, {
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
    throw new Error(`Empty response from ${params.model}`);
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
 * Stage 1: Generates a structured VideoProjectPlan (scenes, narrationScript, and visualBrief).
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
        rawText = await invokeModelForStage1Once({
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
          continue;
        }

        if (classified.kind === "rate_limit") {
          attemptsSummary.push(`${model}/${keyLabel}:429`);
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

          try {
            rawText = await invokeModelForStage1Once({
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
            break;
          }
        } else {
          attemptsSummary.push(`${model}/${keyLabel}:${classified.reason}`);
          break;
        }
      }

      if (rawText === undefined) {
        continue;
      }

      let payload: LLMPlanPayload | undefined;
      try {
        payload = parseAndValidatePlanPayload(rawText);
      } catch (parseError) {
        const feedback = formatValidationError(parseError);
        const retryRemainingMs = deadlineAt - Date.now();
        if (retryRemainingMs <= MIN_CALL_BUDGET_MS) {
          attemptsSummary.push(`${model}/${keyLabel}:zod_deadline`);
          break;
        }

        let retryText: string;
        try {
          retryText = await invokeModelForStage1Once({
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
          break;
        }

        try {
          payload = parseAndValidatePlanPayload(retryText);
        } catch (secondParseError) {
          attemptsSummary.push(
            `${model}/${keyLabel}:repeated_validation_failure`
          );
          break;
        }
      }

      if (payload === undefined) {
        continue;
      }

      const project = hydrateVideoProjectPlan(payload, input);
      const fallbackUsed = modelIndex > 0 || keyIndex > 0;

      return GenerateScriptResponseSchema.parse({
        project,
        modelUsed: model,
        fallbackUsed,
      });
    }
  }

  throw new ScriptGenerationError(
    "All Gemini AI script generation models and keys are currently unavailable or exceeded quota.",
    attemptsSummary
  );
}

// =============================================================================
// STAGE 2: DYNAMIC REMOTION SCENE TSX CODE GENERATION
// =============================================================================

function sanitizeGeneratedSceneCode(raw: string): string {
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```(?:tsx|jsx|typescript|javascript)?\s*/i, "");
  cleaned = cleaned.replace(/\s*```$/i, "");
  cleaned = cleaned.trim();
  // Strip import statements if LLM included any
  cleaned = cleaned.replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, "");
  return cleaned.trim();
}

function validateGeneratedSceneCode(code: string): void {
  if (code.length < 30) {
    throw new Error("Generated scene code is too short or empty.");
  }
  const forbiddenPatterns = [
    /\bwindow\.location\b/,
    /\bdocument\.cookie\b/,
    /\blocalStorage\b/,
    /\bsessionStorage\b/,
    /\bfetch\s*\(/,
    /\bXMLHttpRequest\b/,
    /\beval\s*\(/,
    /\bprocess\.env\b/,
  ];
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(code)) {
      throw new Error(`Generated scene code contains forbidden API: ${pattern.toString()}`);
    }
  }
}

function buildSceneCodeUserPrompt(input: GenerateSceneCodeRequest): string {
  const themeTokens = THEME_COLOR_TOKENS[input.theme] ?? THEME_COLOR_TOKENS.cyber_dark;
  const isPortrait = input.aspectRatio === "9:16";

  let prompt = `Write a self-contained Remotion TSX component for this video scene:
TOPIC: ${input.topic}
SCENE ${input.sceneIndex + 1} of ${input.totalScenes}: "${input.heading}"
${input.subtext ? `SUBTEXT: "${input.subtext}"` : ""}
VISUAL BRIEF (CRITICAL): ${input.visualBrief}
NARRATION VOICEOVER: "${input.narrationScript}"
ASPECT RATIO: ${input.aspectRatio} (isPortrait: ${isPortrait})
THEME: ${input.theme} (palette: ${JSON.stringify(themeTokens)})
ACCENT COLOR: ${input.accentColor}
DURATION: ${input.durationInFrames} frames (~${input.durationInSeconds} seconds at 30 fps)
`;

  if (input.userInstruction) {
    prompt += `\nUSER SPECIFIC REGENERATION INSTRUCTION:\n${input.userInstruction}\n`;
  }

  if (input.previousError) {
    prompt += `\nSELF-CORRECTION REQUIRED:
The previous attempt failed with this error:
${input.previousError}

Previous code snippet:
${input.previousCode || "None"}

Fix the syntax and runtime error completely. Ensure all JSX tags are closed and all variables are defined.`;
  }

  prompt += `\nOUTPUT REQUIREMENTS:
- Return ONLY valid executable TSX code defining and exporting a default React component:
  export default function GeneratedScene() { ... }
- Scope already contains: React, Remotion (useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill, Sequence), Lucide, palette, accentColor, isPortrait, frame, fps, durationInFrames, heading, subtext, narrationScript.
- DO NOT use markdown fences or import statements.
- Strict export safety: pure inline '#hex'/'rgba()' styling, SVG graphics, no conic-gradient, no backdrop-filter, no external CSS.`;

  return prompt;
}

async function invokeModelForCodeOnce(params: {
  apiKey: string;
  model: string;
  input: GenerateSceneCodeRequest;
  callTimeoutMs: number;
  overrides?: ConfigOverrides;
}): Promise<string> {
  const ai = new GoogleGenAI({
    apiKey: params.apiKey,
    apiVersion: "v1beta",
    httpOptions: { timeout: params.callTimeoutMs },
  });

  const thinkingLevel =
    params.overrides?.thinkingLevelOverride ??
    (params.overrides?.omitThinking ? undefined : getThinkingLevelForModel(params.model));

  const config: GenerateContentConfig = {
    temperature: 0.3,
    systemInstruction: params.overrides?.omitSystemInstruction
      ? undefined
      : `${STAGE2_SYSTEM_PROMPT}\n\nFEW-SHOT INSPIRATION EXAMPLES:\n${FEW_SHOT_CODE_EXAMPLES}`,
    ...(thinkingLevel !== undefined
      ? { thinkingConfig: { thinkingLevel } }
      : {}),
  };

  const userPrompt = buildSceneCodeUserPrompt(params.input);

  const response = await ai.models.generateContent({
    model: params.model,
    contents: userPrompt,
    config,
  });

  const text = extractResponseText(response);
  if (!text.trim()) {
    throw new Error(`Empty code response from ${params.model}`);
  }
  return text;
}

/**
 * Stage 2: Generates a self-contained Remotion TSX component for one scene with model fallback.
 */
export async function generateSceneCodeWithFallback(
  rawInput: GenerateSceneCodeRequest,
  options: GenerateScriptOptions = {}
): Promise<GenerateSceneCodeResponse> {
  const input = GenerateSceneCodeRequestSchema.parse(rawInput);

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
        rawText = await invokeModelForCodeOnce({
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
          continue;
        }
        if (classified.kind === "rate_limit") {
          attemptsSummary.push(`${model}/${keyLabel}:429`);
          continue;
        }
        if (classified.kind === "unsupported_param") {
          activeOverrides = buildAdaptedOverrides(model, activeOverrides, classified);
          try {
            rawText = await invokeModelForCodeOnce({
              apiKey,
              model,
              input,
              callTimeoutMs: Math.min(perCallTimeoutMs, deadlineAt - Date.now()),
              overrides: activeOverrides,
            });
          } catch (retryError) {
            attemptsSummary.push(`${model}/${keyLabel}:400_retry_fail`);
            break;
          }
        } else {
          attemptsSummary.push(`${model}/${keyLabel}:${classified.reason}`);
          break;
        }
      }

      if (rawText === undefined) {
        continue;
      }

      const cleanedCode = sanitizeGeneratedSceneCode(rawText);
      try {
        validateGeneratedSceneCode(cleanedCode);
      } catch (valErr) {
        attemptsSummary.push(`${model}/${keyLabel}:code_validation_failed`);
        continue;
      }

      const fallbackUsed = modelIndex > 0 || keyIndex > 0;
      return GenerateSceneCodeResponseSchema.parse({
        code: cleanedCode,
        modelUsed: model,
        fallbackUsed,
        isCorrected: Boolean(input.previousError),
        attemptsSummary,
      });
    }
  }

  throw new ScriptGenerationError(
    "All Gemini AI models failed while generating scene code.",
    attemptsSummary
  );
}

export const generateScriptPlanWithFallback = generateScriptWithFallback;

