import {
  type AspectRatio,
  type GenerateSceneCodeRequest,
  type GenerateSceneCodeResponse,
  GenerateSceneCodeResponseSchema,
  type GenerateScriptRequest,
  type GenerateScriptResponse,
  GenerateScriptResponseSchema,
  type GenerateSpeechRequest,
  type GenerateSpeechResponse,
  GenerateSpeechResponseSchema,
  type LanguageCode,
  type Scene,
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
 * Calls POST /api/generate-script to create a structured VideoProjectPlan schema using Gemini.
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
      const errBody = (await response.json()) as {
        error?: string;
        code?: string;
        attempts?: readonly string[];
      };
      if (errBody?.error) {
        errorMessage = errBody.error;
      }
      if (errBody?.code) {
        errorCode = errBody.code;
      }
      if (Array.isArray(errBody?.attempts) && errBody.attempts.length > 0) {
        const attemptsSummary = errBody.attempts.join(" | ");
        errorMessage = `${errorMessage} Models attempted: [${attemptsSummary}].`;
      }
    } catch {
      // Non-JSON response (e.g. 404 HTML from static dev server or gateway error)
      if (response.status === 404) {
        errorMessage =
          "API route /api/generate-script was not found (HTTP 404). In local development, make sure you are using 'npm run dev' (with built-in Vite API middleware) or 'vercel dev'.";
        errorCode = "API_ROUTE_NOT_FOUND";
      } else {
        errorMessage = `Server returned a non-JSON response with HTTP status ${response.status}.`;
        errorCode = "NON_JSON_RESPONSE";
      }
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
 * Calls POST /api/generate-scene-code to dynamically generate Remotion TSX code for a single scene.
 */
export async function generateSceneCode(
  request: GenerateSceneCodeRequest,
  signal?: AbortSignal
): Promise<GenerateSceneCodeResponse> {
  let response: Response;
  try {
    response = await fetch("/api/generate-scene-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      signal,
    });
  } catch (error) {
    if (signal?.aborted) {
      throw new ApiClientError("Scene code generation was cancelled.", "ABORTED");
    }
    const message =
      error instanceof Error ? error.message : "Network error during scene code generation.";
    throw new ApiClientError(
      `Could not reach scene code generation service: ${message}.`,
      "NETWORK_ERROR"
    );
  }

  if (!response.ok) {
    let errorMessage = `Scene code generation failed with HTTP status ${response.status}.`;
    let errorCode = "SCENE_CODE_GENERATION_FAILED";

    try {
      const errBody = (await response.json()) as {
        error?: string;
        code?: string;
        attempts?: readonly string[];
      };
      if (errBody?.error) {
        errorMessage = errBody.error;
      }
      if (errBody?.code) {
        errorCode = errBody.code;
      }
      if (Array.isArray(errBody?.attempts) && errBody.attempts.length > 0) {
        const attemptsSummary = errBody.attempts.join(" | ");
        errorMessage = `${errorMessage} Models attempted: [${attemptsSummary}].`;
      }
    } catch {
      // Non-JSON response
    }

    throw new ApiClientError(
      `${errorMessage} (Code: ${errorCode}).`,
      errorCode,
      response.status
    );
  }

  const rawJson: unknown = await response.json();
  const parsed = GenerateSceneCodeResponseSchema.safeParse(rawJson);
  if (!parsed.success) {
    console.error("[apiClient] Invalid response format from /api/generate-scene-code:", parsed.error);
    throw new ApiClientError(
      "Received invalid scene code payload from the server.",
      "INVALID_CODE_RESPONSE",
      response.status
    );
  }

  return parsed.data;
}

/**
 * Orchestrates full project generation in AI Code Mode:
 * Step 1: Script generation via Gemini API (Stage 1 plan with visualBrief).
 * Step 2: Edge-TTS synthesis and Stage 2 Remotion scene code generation in parallel per scene.
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

  // Step 1: Script Generation Plan
  onProgress?.({
    phase: "generating-script",
    percent: 10,
    message: "Consulting Gemini AI to compose educational scenes & visual briefs...",
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

  const plan = scriptResponse.project;
  const scenes: Scene[] = plan.scenes.map((s) => ({
    ...s,
    durationInFrames: 150,
    captions: [],
    code: "",
    isCorrected: false,
    isPlaceholder: false,
  }));
  const totalScenes = scenes.length;

  onProgress?.({
    phase: "synthesizing-audio",
    percent: 25,
    message: `Generated plan for ${totalScenes} scenes. Coding Remotion visuals and synthesizing audio in parallel...`,
    currentScene: 0,
    totalScenes,
  });

  // Step 2 & 3: Parallel Edge-TTS Voiceover and Dynamic Remotion Scene Code Generation
  for (let i = 0; i < scenes.length; i++) {
    if (signal?.aborted) {
      throw new ApiClientError("Project generation was cancelled.", "ABORTED");
    }

    const scene = scenes[i];
    const sceneNum = i + 1;
    const progressPercent = 25 + Math.round(((i + 0.5) / totalScenes) * 65);

    onProgress?.({
      phase: "synthesizing-audio",
      percent: progressPercent,
      message: `Scene ${sceneNum}/${totalScenes}: Writing Remotion scene code and synthesizing neural voice...`,
      currentScene: sceneNum,
      totalScenes,
    });

    // 1. Synthesize Speech
    const ttsPromise = synthesizeSpeech(
      {
        text: scene.narrationScript,
        language: plan.language,
      },
      signal
    );

    // 2. Generate Dynamic Remotion Code in parallel
    const codePromise = generateSceneCode(
      {
        topic,
        sceneIndex: i,
        totalScenes,
        heading: scene.heading,
        subtext: scene.subtext,
        visualBrief: scene.visualBrief || scene.heading,
        narrationScript: scene.narrationScript,
        language: plan.language,
        theme: plan.theme,
        aspectRatio: plan.aspectRatio,
        durationInFrames: 150,
        durationInSeconds: 5,
        accentColor: scene.accentColor,
      },
      signal
    ).catch((err) => {
      console.warn(
        `[apiClient] Code generation failed for scene ${sceneNum}, falling back to placeholder card:`,
        err
      );
      return {
        code: "",
        modelUsed: "placeholder",
        fallbackUsed: true,
        isCorrected: false,
      };
    });

    const [speech, codeResult] = await Promise.all([ttsPromise, codePromise]);

    // Apply Mathematical Time-Lock
    scene.audioUrl = speech.audioDataUrl;
    scene.durationInSeconds = speech.durationInSeconds;
    scene.durationInFrames = speech.durationInFrames;
    scene.captions = speech.captions;

    // Attach generated code and metadata
    scene.code = codeResult.code;
    scene.modelUsed = codeResult.modelUsed;
    scene.isCorrected = codeResult.isCorrected;
    scene.isPlaceholder = !codeResult.code || codeResult.modelUsed === "placeholder";
  }

  // Step 4: Recompute total duration & assemble timeline
  onProgress?.({
    phase: "building-timeline",
    percent: 92,
    message: "Locking frame boundaries and aligning karaoke captions...",
    currentScene: totalScenes,
    totalScenes,
  });

  const totalDurationInFrames = scenes.reduce(
    (sum, s) => sum + s.durationInFrames,
    0
  );

  const project: VideoProject = {
    ...plan,
    scenes,
    totalDurationInFrames,
  };

  onProgress?.({
    phase: "ready",
    percent: 100,
    message: `Video ready! ${project.scenes.length} scenes in AI Code Mode, ${Math.round(
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
