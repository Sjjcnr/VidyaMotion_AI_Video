import { z } from "zod";

/**
 * Supported scene template identifiers.
 * Each value maps 1:1 to a deterministic Remotion scene component in src/remotion/scenes/.
 */
export const SceneTypeSchema = z.enum([
  "TITLE_HERO",
  "SPLIT_EXPLAINER",
  "KEY_METRIC_OR_FACT",
  "STEP_BY_STEP_FLOW",
  "SUMMARY_TAKEAWAY",
]);
export type SceneType = z.infer<typeof SceneTypeSchema>;

/**
 * Supported narration & typography languages.
 */
export const LanguageCodeSchema = z.enum(["en-IN", "hi-IN", "gu-IN", "en-US"]);
export type LanguageCode = z.infer<typeof LanguageCodeSchema>;

/**
 * Supported visual themes (resolved to pure #hex / rgba() palettes in themeStyles.ts).
 */
export const ThemeIdSchema = z.enum([
  "cyber_dark",
  "clean_modern",
  "sunset_amber",
  "emerald_nature",
]);
export type ThemeId = z.infer<typeof ThemeIdSchema>;

/**
 * Supported video canvas aspect ratios.
 */
export const AspectRatioSchema = z.enum(["16:9", "9:16"]);
export type AspectRatio = z.infer<typeof AspectRatioSchema>;

/**
 * Single word timing entry in milliseconds (relative to the parent scene start).
 * Converted to @remotion/captions Caption[] in src/remotion/utils/captions.ts.
 */
export const CaptionWordSchema = z.object({
  text: z.string(),
  startMs: z.number().nonnegative(),
  endMs: z.number().nonnegative(),
});
export type CaptionWord = z.infer<typeof CaptionWordSchema>;

/**
 * Full scene contract (matches Section 3 + dynamic audio duration & karaoke captions).
 */
export const SceneSchema = z.object({
  id: z.string().min(1),
  type: SceneTypeSchema,
  heading: z.string().max(80),
  subtext: z.string().max(160).optional(),
  bulletPoints: z.array(z.string().max(100)).max(4).optional(),
  highlightWord: z.string().max(30).optional(),
  iconName: z.string().default("Sparkles"),
  narrationScript: z.string().min(1),
  accentColor: z.string().default("#06B6D4"),
  durationInFrames: z.number().int().positive().default(150),
  durationInSeconds: z.number().positive().optional(),
  audioUrl: z.string().optional(),
  captions: z.array(CaptionWordSchema).optional(),
});
export type Scene = z.infer<typeof SceneSchema>;

/**
 * Full Remotion VideoProject contract (single source of truth across frontend & /api).
 */
export const VideoProjectSchema = z.object({
  id: z.string().min(1),
  topic: z.string().min(1),
  language: LanguageCodeSchema.default("en-IN"),
  theme: ThemeIdSchema.default("cyber_dark"),
  aspectRatio: AspectRatioSchema.default("16:9"),
  fps: z.literal(30),
  scenes: z.array(SceneSchema).min(3).max(6),
  totalDurationInFrames: z.number().int().positive(),
});
export type VideoProject = z.infer<typeof VideoProjectSchema>;

/**
 * Raw LLM scene contract (without client/TTS-populated audioUrl, durationInSeconds, or captions).
 * Kept pure (no Zod transforms) so z.toJSONSchema() produces clean JSON Schema for Gemini.
 */
export const LLMSceneSchema = z.object({
  id: z.string().optional(),
  type: SceneTypeSchema,
  heading: z.string().max(80),
  subtext: z.string().max(160).optional(),
  bulletPoints: z.array(z.string().max(100)).max(4).optional(),
  highlightWord: z.string().max(30).optional(),
  iconName: z.string().default("Sparkles"),
  narrationScript: z.string().min(1),
  accentColor: z.string().default("#06B6D4"),
});
export type LLMScene = z.infer<typeof LLMSceneSchema>;

export const LLMSceneArraySchema = z.array(LLMSceneSchema).min(3).max(6);

export const LLMScriptPayloadSchema = z.object({
  scenes: LLMSceneArraySchema,
});
export type LLMScriptPayload = z.infer<typeof LLMScriptPayloadSchema>;

/**
 * POST /api/generate-script request & response contracts.
 */
export const GenerateScriptRequestSchema = z.object({
  topic: z.string().trim().min(2).max(200),
  language: LanguageCodeSchema.default("en-IN"),
  theme: ThemeIdSchema.default("cyber_dark"),
  aspectRatio: AspectRatioSchema.default("16:9"),
});
export type GenerateScriptRequest = z.infer<typeof GenerateScriptRequestSchema>;

export const GenerateScriptResponseSchema = z.object({
  project: VideoProjectSchema,
  modelUsed: z.string(),
  fallbackUsed: z.boolean(),
});
export type GenerateScriptResponse = z.infer<typeof GenerateScriptResponseSchema>;

/**
 * POST /api/generate-speech request & response contracts.
 */
export const GenerateSpeechRequestSchema = z.object({
  text: z.string().trim().min(1).max(3000),
  language: LanguageCodeSchema.default("en-IN"),
  voice: z.string().optional(),
});
export type GenerateSpeechRequest = z.infer<typeof GenerateSpeechRequestSchema>;

export const GenerateSpeechResponseSchema = z.object({
  audioDataUrl: z.string(),
  durationInSeconds: z.number().positive(),
  durationInFrames: z.number().int().positive(),
  captions: z.array(CaptionWordSchema),
});
export type GenerateSpeechResponse = z.infer<typeof GenerateSpeechResponseSchema>;
