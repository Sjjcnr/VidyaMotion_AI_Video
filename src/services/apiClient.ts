import {
  type AspectRatio,
  type GenerateScriptRequest,
  type GenerateScriptResponse,
  GenerateScriptResponseSchema,
  type GenerateSpeechRequest,
  type GenerateSpeechResponse,
  GenerateSpeechResponseSchema,
  type LanguageCode,
  type ThemeId,
  type VideoProject,
} from "../remotion/types";

export type GenerationPhase =
  | "idle"
  | "generating-script"
  | "synthesizing-audio"
  | "building-timeline"
  | "ready"
  | "error";

export interface BuildProgress {
  phase: GenerationPhase;
  percent: number;
  message: string;
  currentScene?: number;
  totalScenes?: number;
}

export interface BuildVideoProjectOptions {
  topic: string;
  language?: LanguageCode;
  theme?: ThemeId;
  aspectRatio?: AspectRatio;
  onProgress?: (progress: BuildProgress) => void;
  signal?: AbortSignal;
}

export interface BuildVideoProjectResult {
  project: VideoProject;
  modelUsed: string;
  fallbackUsed: boolean;
}

export class ApiClientError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;
  public readonly isExpoFallbackAvailable: boolean;

  constructor(message: string, code = "API_ERROR", statusCode?: number) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.statusCode = statusCode;
    this.isExpoFallbackAvailable = true;
  }
}

/**
 * Calls POST /api/generate-script to create a structured VideoProject schema using Gemini.
 */
export async function generateScript(
  request: GenerateScriptRequest,
  signal?: AbortSignal
): Promise<GenerateScriptResponse> {
  let response: Response;
  try {
    response = await fetch("/api/generate-script", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      signal,
    });
  } catch (error) {
    if (signal?.aborted) {
      throw new ApiClientError("Script generation was cancelled.", "ABORTED");
    }
    const message =
      error instanceof Error ? error.message : "Network error during script generation.";
    throw new ApiClientError(
      `Could not reach script generation service: ${message}. You can load one of the 4 offline Expo Showcase presets instantly!`,
      "NETWORK_ERROR"
    );
  }

  if (!response.ok) {
    let errorMessage = `Script generation failed with HTTP status ${response.status}.`;
    let errorCode = "SCRIPT_GENERATION_FAILED";

    try {
      const errBody = (await response.json()) as { error?: string; code?: string };
      if (errBody?.error) {
        errorMessage = errBody.error;
      }
      if (errBody?.code) {
        errorCode = errBody.code;
      }
    } catch {
      // Non-JSON response
    }

    throw new ApiClientError(
      `${errorMessage} (Code: ${errorCode}). You can load an offline Expo Showcase preset to continue without API access.`,
      errorCode,
      response.status
    );
  }

  const rawJson: unknown = await response.json();
  const parsed = GenerateScriptResponseSchema.safeParse(rawJson);
  if (!parsed.success) {
    console.error("[apiClient] Invalid response format from /api/generate-script:", parsed.error);
    throw new ApiClientError(
      "Received an invalid script schema from the server. You can switch to an Expo Showcase preset.",
      "INVALID_SCHEMA",
      response.status
    );
  }

  return parsed.data;
}

/**
 * Calls POST /api/generate-speech to synthesize edge-tts narration audio and word timestamps.
 */
export async function synthesizeSpeech(
  request: GenerateSpeechRequest,
  signal?: AbortSignal
): Promise<GenerateSpeechResponse> {
  let response: Response;
  try {
    response = await fetch("/api/generate-speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      signal,
    });
  } catch (error) {
    if (signal?.aborted) {
      throw new ApiClientError("Speech synthesis was cancelled.", "ABORTED");
    }
    const message =
      error instanceof Error ? error.message : "Network error during speech synthesis.";
    throw new ApiClientError(
      `Could not reach TTS synthesis service: ${message}. Offline showcase presets include pre-rendered audio.`,
      "NETWORK_ERROR"
    );
  }

  if (!response.ok) {
    let errorMessage = `Speech synthesis failed with HTTP status ${response.status}.`;
    let errorCode = "TTS_SYNTHESIS_FAILED";

    try {
      const errBody = (await response.json()) as { error?: string; code?: string };
      if (errBody?.error) {
        errorMessage = errBody.error;
      }
      if (errBody?.code) {
        errorCode = errBody.code;
      }
    } catch {
      // Non-JSON response
    }

    throw new ApiClientError(
      `${errorMessage} (Code: ${errorCode}). Offline showcase presets are available.`,
      errorCode,
      response.status
    );
  }

  const rawJson: unknown = await response.json();
  const parsed = GenerateSpeechResponseSchema.safeParse(rawJson);
  if (!parsed.success) {
    console.error("[apiClient] Invalid response format from /api/generate-speech:", parsed.error);
    throw new ApiClientError(
      "Received invalid audio timing payload from the TTS server.",
      "INVALID_TTS_RESPONSE",
      response.status
    );
  }

  return parsed.data;
}

/**
 * Orchestrates full project generation:
 * Step 1: Script generation via Gemini API.
 * Step 2: Edge-TTS synthesis for each scene sequentially.
 * Step 3: Mathematical Time-Lock application (audioUrl, durationInSeconds, durationInFrames, captions).
 * Step 4: Total duration recalculation and timeline assembly.
 */
export async function buildFullVideoProject(
  topicOrOptions: string | BuildVideoProjectOptions,
  langArg: LanguageCode = "en-IN",
  themeArg: ThemeId = "cyber_dark",
  aspectRatioArg: AspectRatio = "16:9",
  onProgressArg?: (progress: BuildProgress) => void
): Promise<BuildVideoProjectResult> {
  let topic: string;
  let language: LanguageCode;
  let theme: ThemeId;
  let aspectRatio: AspectRatio;
  let onProgress: ((progress: BuildProgress) => void) | undefined;
  let signal: AbortSignal | undefined;

  if (typeof topicOrOptions === "object" && topicOrOptions !== null) {
    topic = topicOrOptions.topic;
    language = topicOrOptions.language ?? "en-IN";
    theme = topicOrOptions.theme ?? "cyber_dark";
    aspectRatio = topicOrOptions.aspectRatio ?? "16:9";
    onProgress = topicOrOptions.onProgress;
    signal = topicOrOptions.signal;
  } else {
    topic = topicOrOptions;
    language = langArg;
    theme = themeArg;
    aspectRatio = aspectRatioArg;
    onProgress = onProgressArg;
  }

  // Step 1: Script Generation
  onProgress?.({
    phase: "generating-script",
    percent: 10,
    message: "Consulting Gemini AI to compose educational scenes...",
  });

  const scriptResponse = await generateScript(
    {
      topic,
      language,
      theme,
      aspectRatio,
    },
    signal
  );

  const project: VideoProject = scriptResponse.project;
  const scenes = project.scenes;
  const totalScenes = scenes.length;

  onProgress?.({
    phase: "synthesizing-audio",
    percent: 30,
    message: `Generated ${totalScenes} scenes. Starting neural voiceover synthesis...`,
    currentScene: 0,
    totalScenes,
  });

  // Step 2 & 3: Sequential Edge-TTS voiceover synthesis & Mathematical Time-Lock
  for (let i = 0; i < scenes.length; i++) {
    if (signal?.aborted) {
      throw new ApiClientError("Project generation was cancelled.", "ABORTED");
    }

    const scene = scenes[i];
    const sceneNum = i + 1;
    const progressPercent = 30 + Math.round(((i + 0.2) / totalScenes) * 55);

    onProgress?.({
      phase: "synthesizing-audio",
      percent: progressPercent,
      message: `Synthesizing neural voice for Scene ${sceneNum} of ${totalScenes}: "${scene.heading}"...`,
      currentScene: sceneNum,
      totalScenes,
    });

    const speech = await synthesizeSpeech(
      {
        text: scene.narrationScript,
        language: project.language,
      },
      signal
    );

    // Apply Mathematical Time-Lock
    scene.audioUrl = speech.audioDataUrl;
    scene.durationInSeconds = speech.durationInSeconds;
    scene.durationInFrames = speech.durationInFrames;
    scene.captions = speech.captions;
  }

  // Step 4: Recompute total duration & assemble timeline
  onProgress?.({
    phase: "building-timeline",
    percent: 92,
    message: "Locking frame boundaries and aligning karaoke captions...",
    currentScene: totalScenes,
    totalScenes,
  });

  project.totalDurationInFrames = project.scenes.reduce(
    (sum, s) => sum + s.durationInFrames,
    0
  );

  onProgress?.({
    phase: "ready",
    percent: 100,
    message: `Video ready! ${project.scenes.length} scenes, ${Math.round(
      project.totalDurationInFrames / 30
    )}s runtime.`,
    currentScene: totalScenes,
    totalScenes,
  });

  return {
    project,
    modelUsed: scriptResponse.modelUsed,
    fallbackUsed: scriptResponse.fallbackUsed,
  };
}
