import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_SHOWCASE_PROJECT, SHOWCASE_PRESETS } from "../data/showcasePresets";
import {
  type AspectRatio,
  type LanguageCode,
  type Scene,
  type ThemeId,
  type VideoProject,
  VideoProjectSchema,
} from "../remotion/types";
import {
  buildFullVideoProject,
  generateSceneCode,
  type GenerationPhase,
} from "../services/apiClient";

const STORAGE_KEY = "vidyamotion_saved_projects_v1";

function loadSavedProjectsFromStorage(): VideoProject[] {
  if (typeof window === "undefined" || !window.localStorage) {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => {
        const check = VideoProjectSchema.safeParse(item);
        return check.success ? check.data : null;
      })
      .filter((item): item is VideoProject => item !== null);
  } catch (error) {
    console.warn("[useVideoProject] Failed to parse localStorage saved projects:", error);
    return [];
  }
}

function persistProjectsToStorage(projects: VideoProject[]): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.warn("[useVideoProject] Failed to persist saved projects:", error);
  }
}

export interface GenerateVideoOptions {
  topic: string;
  language?: LanguageCode;
  theme?: ThemeId;
  aspectRatio?: AspectRatio;
  customInstruction?: string;
}

export function useVideoProject() {
  const [currentProject, setCurrentProject] = useState<VideoProject>(() => {
    // Deep clone default preset so in-memory mutations are isolated
    return JSON.parse(JSON.stringify(DEFAULT_SHOWCASE_PROJECT)) as VideoProject;
  });

  const [generationStatus, setGenerationStatus] = useState<GenerationPhase>("idle");
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>(
    "Ready. Enter a topic or select a featured demo."
  );
  const [error, setError] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>("Offline Preset Cache");
  const [fallbackUsed, setFallbackUsed] = useState<boolean>(false);

  const [savedProjects, setSavedProjects] = useState<VideoProject[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize saved projects from localStorage on mount
  useEffect(() => {
    const stored = loadSavedProjectsFromStorage();
    if (stored.length > 0) {
      setSavedProjects(stored);
    }
  }, []);

  /**
   * Instantly load one of the 4 verified offline showcase presets.
   */
  const loadPreset = useCallback((presetId: string): boolean => {
    const match = SHOWCASE_PRESETS.find(
      (p) => p.id === presetId || p.project.id === presetId
    );
    if (!match) {
      console.warn(`[useVideoProject] Preset not found: ${presetId}`);
      return false;
    }

    // Cancel any in-flight generation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    const cloned = JSON.parse(JSON.stringify(match.project)) as VideoProject;
    setCurrentProject(cloned);
    setGenerationStatus("ready");
    setGenerationProgress(100);
    setStatusMessage(`Loaded offline showcase preset: "${match.label}"`);
    setError(null);
    setModelUsed("Expo Pre-warmed Cache");
    setFallbackUsed(false);
    return true;
  }, []);

  /**
   * Real-time live heading update for a scene in the preview canvas.
   */
  const updateSceneHeading = useCallback((sceneId: string, newHeading: string) => {
    setCurrentProject((prev) => {
      const updatedScenes = prev.scenes.map((s) =>
        s.id === sceneId ? { ...s, heading: newHeading } : s
      );
      return { ...prev, scenes: updatedScenes };
    });
  }, []);

  /**
   * Real-time live icon swap for a scene in the preview canvas.
   */
  const updateSceneIcon = useCallback((sceneId: string, newIcon: string) => {
    setCurrentProject((prev) => {
      const updatedScenes = prev.scenes.map((s) =>
        s.id === sceneId ? { ...s, iconName: newIcon } : s
      );
      return { ...prev, scenes: updatedScenes };
    });
  }, []);

  /**
   * Generalized update for any scene property (e.g. highlightWord, subtext).
   */
  const updateScene = useCallback((sceneId: string, updates: Partial<Scene>) => {
    setCurrentProject((prev) => {
      const updatedScenes = prev.scenes.map((s) =>
        s.id === sceneId ? { ...s, ...updates } : s
      );
      const totalDurationInFrames = updatedScenes.reduce(
        (sum, s) => sum + s.durationInFrames,
        0
      );
      return {
        ...prev,
        scenes: updatedScenes,
        totalDurationInFrames,
      };
    });
  }, []);

  /**
   * Save the current project to local storage.
   */
  const saveCurrentProject = useCallback(() => {
    setSavedProjects((prev) => {
      const filtered = prev.filter((p) => p.id !== currentProject.id);
      const updated = [currentProject, ...filtered].slice(0, 25);
      persistProjectsToStorage(updated);
      return updated;
    });
    setStatusMessage(`Project "${currentProject.topic}" saved locally.`);
  }, [currentProject]);

  /**
   * Delete a saved project from local storage.
   */
  const deleteSavedProject = useCallback((projectId: string) => {
    setSavedProjects((prev) => {
      const updated = prev.filter((p) => p.id !== projectId);
      persistProjectsToStorage(updated);
      return updated;
    });
  }, []);

  /**
   * Load an existing saved project into active view.
   */
  const loadSavedProject = useCallback(
    (projectId: string) => {
      const target = savedProjects.find((p) => p.id === projectId);
      if (target) {
        const cloned = JSON.parse(JSON.stringify(target)) as VideoProject;
        setCurrentProject(cloned);
        setGenerationStatus("ready");
        setGenerationProgress(100);
        setStatusMessage(`Loaded saved project: "${cloned.topic}"`);
        setError(null);
      }
    },
    [savedProjects]
  );

  /**
   * Full end-to-end autonomous video generation pipeline:
   * Gemini Scripting -> Edge-TTS Audio -> Mathematical Time-Lock -> Timeline Assembly.
   */
  const generateVideo = useCallback(
    async (options: GenerateVideoOptions): Promise<VideoProject | null> => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const ac = new AbortController();
      abortControllerRef.current = ac;

      setError(null);
      setGenerationStatus("generating-script");
      setGenerationProgress(5);
      setStatusMessage("Starting generation pipeline...");

      try {
        const result = await buildFullVideoProject({
          topic: options.topic,
          language: options.language ?? currentProject.language,
          theme: options.theme ?? currentProject.theme,
          aspectRatio: options.aspectRatio ?? currentProject.aspectRatio,
          customInstruction: options.customInstruction,
          signal: ac.signal,
          onProgress: (progress) => {
            setGenerationStatus(progress.phase);
            setGenerationProgress(progress.percent);
            setStatusMessage(progress.message);
          },
        });

        setCurrentProject(result.project);
        setModelUsed(result.modelUsed);
        setFallbackUsed(result.fallbackUsed);
        setGenerationStatus("ready");
        setGenerationProgress(100);
        setStatusMessage(
          `Generated in ${result.project.scenes.length} scenes (${result.modelUsed})`
        );

        // Auto-save to saved list
        setSavedProjects((prev) => {
          const filtered = prev.filter((p) => p.id !== result.project.id);
          const updated = [result.project, ...filtered].slice(0, 25);
          persistProjectsToStorage(updated);
          return updated;
        });

        return result.project;
      } catch (err) {
        if (ac.signal.aborted) {
          setGenerationStatus("idle");
          setStatusMessage("Generation cancelled.");
          return null;
        }

        const msg = err instanceof Error ? err.message : "Video generation failed.";
        setError(msg);
        setGenerationStatus("error");
        setStatusMessage(msg);
        return null;
      } finally {
        if (abortControllerRef.current === ac) {
          abortControllerRef.current = null;
        }
      }
    },
    [currentProject.aspectRatio, currentProject.language, currentProject.theme]
  );

  /**
   * Abort in-flight generation.
   */
  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setGenerationStatus("idle");
      setGenerationProgress(0);
      setStatusMessage("Generation cancelled by user.");
    }
  }, []);

  /**
   * Regenerate Remotion TSX code for a single scene with an optional user instruction.
   */
  const regenerateScene = useCallback(
    async (sceneId: string, instruction?: string): Promise<boolean> => {
      const sceneIndex = currentProject.scenes.findIndex((s) => s.id === sceneId);
      if (sceneIndex === -1) return false;

      const scene = currentProject.scenes[sceneIndex];
      setStatusMessage(`Regenerating scene ${sceneIndex + 1} code...`);

      try {
        const result = await generateSceneCode({
          topic: currentProject.topic,
          sceneIndex,
          totalScenes: currentProject.scenes.length,
          heading: scene.heading,
          subtext: scene.subtext,
          visualBrief: scene.visualBrief || scene.heading,
          narrationScript: scene.narrationScript,
          language: currentProject.language,
          theme: currentProject.theme,
          aspectRatio: currentProject.aspectRatio,
          durationInFrames: scene.durationInFrames,
          durationInSeconds: scene.durationInSeconds || scene.durationInFrames / 30,
          accentColor: scene.accentColor,
          userInstruction: instruction,
          previousCode: scene.code,
        });

        updateScene(sceneId, {
          code: result.code,
          modelUsed: result.modelUsed,
          isCorrected: result.isCorrected,
          isPlaceholder: false,
        });

        setStatusMessage(`Scene ${sceneIndex + 1} code regenerated via ${result.modelUsed}!`);
        return true;
      } catch (err) {
        console.error("[useVideoProject] Failed to regenerate scene:", err);
        setStatusMessage(`Failed to regenerate scene ${sceneIndex + 1}.`);
        return false;
      }
    },
    [currentProject, updateScene]
  );

  return {
    currentProject,
    setCurrentProject,
    generationStatus,
    generationProgress,
    statusMessage,
    error,
    modelUsed,
    fallbackUsed,
    savedProjects,
    loadPreset,
    updateSceneHeading,
    updateSceneIcon,
    updateScene,
    regenerateScene,
    generateVideo,
    cancelGeneration,
    saveCurrentProject,
    deleteSavedProject,
    loadSavedProject,
  };
}
