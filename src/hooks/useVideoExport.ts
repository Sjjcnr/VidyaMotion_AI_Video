import {
  canRenderMediaOnWeb,
  getEncodableAudioCodecs,
  renderMediaOnWeb,
} from "@remotion/web-renderer";
import { useCallback, useEffect, useRef, useState } from "react";
import { calculateVideoMetadata, COMPOSITION_ID } from "../remotion/Root";
import type { VideoProject } from "../remotion/types";
import {
  type ExportResolution,
  getCanvasDimensions,
} from "../remotion/utils/themeStyles";
import { VideoComposition } from "../remotion/VideoComposition";

export type { ExportResolution };

export interface ExportBenchmarkOptions {
  frames?: number;
  resolution?: ExportResolution;
  hardwareAcceleration?: "no-preference" | "prefer-hardware";
  nativeDimensions?: boolean;
  pageResponsiveness?: "disabled" | "low" | "medium" | "high";
}

export interface ExportBenchmarkResult {
  resolution: string;
  native: boolean;
  hardwareAcceleration: string;
  frames: number;
  elapsedMs: number;
  elapsedSec: number;
  msPerFrame: number;
  renderFps: number;
  blobSizeBytes: number;
}

export interface VideoExportState {
  exportVideo: (
    project: VideoProject,
    resolution?: ExportResolution
  ) => Promise<void>;
  runExportBenchmark: (
    project: VideoProject,
    options?: ExportBenchmarkOptions
  ) => Promise<ExportBenchmarkResult>;
  cancelExport: () => void;
  isExporting: boolean;
  exportProgress: number; // 0..100
  canExport: boolean;
  exportError: string | null;
  checkSupport: () => Promise<boolean>;
}

export function useVideoExport(): VideoExportState {
  const [canExport, setCanExport] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportError, setExportError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Check WebCodecs and canvas encoding capabilities for client-side MP4 generation.
   */
  const checkSupport = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined") {
      setCanExport(false);
      return false;
    }

    try {
      // Check audio codecs
      const audioCodecs = await getEncodableAudioCodecs("mp4");
      const hasAacOrMp3 =
        audioCodecs.includes("aac") || audioCodecs.includes("mp3");

      const testResult = await canRenderMediaOnWeb({
        container: "mp4",
        width: 1920,
        height: 1080,
      });

      const supported = testResult.canRender && hasAacOrMp3;
      setCanExport(supported);
      return supported;
    } catch (err) {
      console.warn("[useVideoExport] WebCodecs capability probe failed:", err);
      // In Chromium with WebCodecs, fallback to optimistic true or check VideoEncoder
      const hasWebCodecs = typeof (window as unknown as { VideoEncoder?: unknown }).VideoEncoder !== "undefined";
      setCanExport(hasWebCodecs);
      return hasWebCodecs;
    }
  }, []);

  // Run probe once on mount
  useEffect(() => {
    void checkSupport();
  }, [checkSupport]);

  /**
   * Execute in-browser client-side video export (Approach 2).
   * Encodes frames and audio using WebCodecs into an MP4 file with zero server rendering.
   */
  const exportVideo = useCallback(
    async (
      project: VideoProject,
      resolution: ExportResolution = "720p"
    ): Promise<void> => {
      if (isExporting) {
        return;
      }

      setExportError(null);
      setIsExporting(true);
      setExportProgress(0);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const { width, height } = getCanvasDimensions(project.aspectRatio ?? "16:9");
        // 720p reduces pixel volume by 55.6% (1280x720 / 720x1280 vs 1920x1080 / 1080x1920), giving a 2.5x-3x export speedup
        const scale = resolution === "720p" ? 2 / 3 : 1;

        // Verify export support
        let support = false;
        try {
          const test = await canRenderMediaOnWeb({
            container: "mp4",
            width,
            height,
            scale,
          });
          support = test.canRender;
          if (!support) {
            const issues = test.issues.map((i) => i.message).join(", ");
            throw new Error(
              `WebCodecs export not supported in this browser: ${issues || "Unsupported codecs"}. Recommend Google Chrome or MS Edge.`
            );
          }
        } catch (probeErr) {
          if (probeErr instanceof Error && probeErr.message.includes("WebCodecs")) {
            throw probeErr;
          }
          // Non-blocking probe warning
          console.warn("[useVideoExport] Capability check warning:", probeErr);
        }

        const durationInFrames = Math.max(
          1,
          project.totalDurationInFrames ||
            project.scenes.reduce((sum, s) => sum + s.durationInFrames, 0)
        );

        // Check for dedicated Cloud Render Worker (Azure Container Apps)
        const renderApiUrl =
          (typeof window !== "undefined" &&
            (window as unknown as { __VIDYAMOTION_RENDER_URL__?: string })
              .__VIDYAMOTION_RENDER_URL__) ||
          import.meta.env.VITE_RENDER_API_URL;

        if (renderApiUrl) {
          try {
            console.log(`[useVideoExport] Dispatching to Cloud Render Engine: ${renderApiUrl}`);
            const cloudResp = await fetch(
              `${renderApiUrl.replace(/\/$/, "")}/api/render`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ project, resolution }),
                signal: controller.signal,
              }
            );

            if (cloudResp.ok) {
              const blob = await cloudResp.blob();
              const blobUrl = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = blobUrl;
              a.download = `${project.id || "vidyamotion"}-${resolution}.mp4`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(blobUrl);
              setExportProgress(100);
              return;
            } else {
              console.warn(
                `[useVideoExport] Cloud render returned status ${cloudResp.status}, falling back to browser render.`
              );
            }
          } catch (cloudErr) {
            if (controller.signal.aborted) {
              return;
            }
            console.warn(
              "[useVideoExport] Cloud render error, falling back to client-side WebCodecs render:",
              cloudErr
            );
          }
        }

        // Render client-side video with chosen resolution scale
        const renderResult = await renderMediaOnWeb({
          composition: {
            id: COMPOSITION_ID,
            component: VideoComposition,
            width,
            height,
            fps: 30,
            durationInFrames,
            defaultProps: project,
            calculateMetadata: calculateVideoMetadata,
          },
          inputProps: project,
          container: "mp4",
          scale,
          hardwareAcceleration: "no-preference",
          pageResponsiveness: "disabled",
          signal: controller.signal,
          onProgress: (progress) => {
            const percentage = Math.min(
              100,
              Math.max(0, Math.round(progress.progress * 100))
            );
            setExportProgress(percentage);
          },
        });

        const blob = await renderResult.getBlob();

        // Sanitize topic slug for file download
        const rawTopic = project.topic || "video";
        const slug =
          rawTopic
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "")
            .slice(0, 50) || "project";
        const filename = `vidyamotion-${slug}-${resolution}.mp4`;

        // Trigger browser download
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Revoke after delay
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
        }, 15000);

        setExportProgress(100);
      } catch (err) {
        if (controller.signal.aborted) {
          setExportError(null);
          return;
        }

        const message =
          err instanceof Error
            ? err.message
            : "Video export failed unexpectedly in browser.";
        setExportError(message);
        throw err;
      } finally {
        setIsExporting(false);
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },
    [isExporting]
  );

  /**
   * Run headless/in-browser performance benchmark for video export.
   */
  const runExportBenchmark = useCallback(
    async (
      project: VideoProject,
      options: ExportBenchmarkOptions = {}
    ): Promise<ExportBenchmarkResult> => {
      const frames = options.frames || 90;
      const resolution = options.resolution || "720p";
      const hw = options.hardwareAcceleration || "no-preference";
      const native = !!options.nativeDimensions;
      const responsiveness = options.pageResponsiveness ?? "disabled";

      let { width, height } = getCanvasDimensions(project.aspectRatio ?? "16:9");
      let scale = resolution === "720p" ? 2 / 3 : 1;
      if (native && resolution === "720p") {
        width = project.aspectRatio === "9:16" ? 720 : 1280;
        height = project.aspectRatio === "9:16" ? 1280 : 720;
        scale = 1;
      }

      const startTime = performance.now();
      const renderResult = await renderMediaOnWeb({
        composition: {
          id: COMPOSITION_ID,
          component: VideoComposition,
          width,
          height,
          fps: 30,
          durationInFrames: frames,
          defaultProps: project,
          calculateMetadata: calculateVideoMetadata,
        },
        inputProps: project,
        container: "mp4",
        scale,
        frameRange: [0, frames - 1],
        hardwareAcceleration: hw,
        pageResponsiveness: responsiveness,
      });

      const blob = await renderResult.getBlob();
      const elapsedMs = performance.now() - startTime;
      const elapsedSec = elapsedMs / 1000;
      const msPerFrame = elapsedMs / frames;
      const renderFps = frames / elapsedSec;

      return {
        resolution,
        native,
        hardwareAcceleration: hw,
        frames,
        elapsedMs,
        elapsedSec,
        msPerFrame,
        renderFps,
        blobSizeBytes: blob.size,
      };
    },
    []
  );

  /**
   * Cancel active video export.
   */
  const cancelExport = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsExporting(false);
      setExportProgress(0);
      setExportError(null);
    }
  }, []);

  return {
    exportVideo,
    runExportBenchmark,
    cancelExport,
    isExporting,
    exportProgress,
    canExport,
    exportError,
    checkSupport,
  };
}
