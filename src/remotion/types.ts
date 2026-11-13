import { z } from "zod";

/**
 * Supported scene template identifiers (for static exemplars & references).
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
 * Stage 1 Plan Scene contract (returned by Gemini script planner).
 */
export const PlanSceneSchema = z.object({
  id: z.string().min(1),
  heading: z.string().max(120),
  subtext: z.string().max(250).optional(),
  narrationScript: z.string().min(1),
  visualBrief: z.string().min(1),
  accentColor: z.string().default("#06B6D4"),
});
export type PlanScene = z.infer<typeof PlanSceneSchema>;

/**
 * Stage 1 Video Project Plan contract.
 */
export const VideoProjectPlanSchema = z.object({
  id: z.string().min(1),
  topic: z.string().min(1),
  language: LanguageCodeSchema.default("en-IN"),
  theme: ThemeIdSchema.default("cyber_dark"),
  aspectRatio: AspectRatioSchema.default("16:9"),
  fps: z.literal(30),
  scenes: z.array(PlanSceneSchema).min(3).max(6),
});
export type VideoProjectPlan = z.infer<typeof VideoProjectPlanSchema>;

/**
 * Full AI Code Mode Scene contract.
 * Contains dynamic Remotion TSX code executed by DynamicSceneRunner.
 */
export const SceneSchema = z.object({
  id: z.string().min(1),
  heading: z.string().max(120),
  subtext: z.string().max(250).optional(),
  narrationScript: z.string().min(1),
  visualBrief: z.string().optional(),
  code: z.string().default("").optional(),
  type: z.string().optional(), // Kept optional for backward compatibility
  bulletPoints: z.array(z.string()).optional(),
  highlightWord: z.string().optional(),
  iconName: z.string().optional(),
  accentColor: z.string().default("#06B6D4"),
  durationInFrames: z.number().int().positive().default(150),
  durationInSeconds: z.number().positive().optional(),
  audioUrl: z.string().optional(),
  captions: z.array(CaptionWordSchema).default([]).optional(),
  modelUsed: z.string().optional(),
  isCorrected: z.boolean().default(false).optional(),
  isPlaceholder: z.boolean().default(false).optional(),
  generationError: z.string().optional(),
});
export type Scene = z.infer<typeof SceneSchema>;

/**
 * Stage 2 Generated Scene contract (Scene with AI-generated TSX code).
 */
export const GeneratedSceneSchema = SceneSchema.extend({
  code: z.string().min(1),
  tsxCode: z.string().optional(),
});
export type GeneratedScene = z.infer<typeof GeneratedSceneSchema>;

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
 * Raw LLM Stage 1 scene plan schema.
 * Kept pure (no Zod transforms) so z.toJSONSchema() produces clean JSON Schema for Gemini.
 */
export const LLMPlanSceneSchema = z.object({
  id: z.string().optional(),
  heading: z.string().max(120),
  subtext: z.string().max(250).optional(),
  narrationScript: z.string().min(1),
  visualBrief: z.string().min(1),
  accentColor: z.string().default("#06B6D4"),
});
export type LLMPlanScene = z.infer<typeof LLMPlanSceneSchema>;

export const LLMPlanPayloadSchema = z.object({
  scenes: z.array(LLMPlanSceneSchema).min(3).max(6),
});
export type LLMPlanPayload = z.infer<typeof LLMPlanPayloadSchema>;

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
  project: VideoProjectPlanSchema,
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

/**
 * POST /api/generate-scene-code request & response contracts (Stage 2).
 */
export const GenerateSceneCodeRequestSchema = z.object({
  topic: z.string().min(1),
  sceneIndex: z.number().int().nonnegative(),
  totalScenes: z.number().int().positive(),
  heading: z.string().min(1),
  subtext: z.string().optional(),
  visualBrief: z.string().min(1),
  narrationScript: z.string().min(1),
  language: LanguageCodeSchema.default("en-IN"),
  theme: ThemeIdSchema.default("cyber_dark"),
  aspectRatio: AspectRatioSchema.default("16:9"),
  durationInFrames: z.number().int().positive().default(150),
  durationInSeconds: z.number().positive().default(5),
  accentColor: z.string().default("#06B6D4"),
  previousError: z.string().optional(),
  previousCode: z.string().optional(),
  userInstruction: z.string().optional(),
});
export type GenerateSceneCodeRequest = z.infer<typeof GenerateSceneCodeRequestSchema>;

export const GenerateSceneCodeResponseSchema = z.object({
  code: z.string().min(1),
  modelUsed: z.string(),
  fallbackUsed: z.boolean(),
  isCorrected: z.boolean(),
  attemptsSummary: z.array(z.string()).optional(),
});
export type GenerateSceneCodeResponse = z.infer<typeof GenerateSceneCodeResponseSchema>;
