import { Player, type PlayerRef } from "@remotion/player";
import {
  AlertTriangle,
  Check,
  Download,
  Info,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  XCircle,
  Zap,
} from "lucide-react";
import React, { useEffect, useId, useRef, useState } from "react";
import type { VideoProject } from "../remotion/types";
import {
  type ExportResolution,
  getCanvasDimensions,
} from "../remotion/utils/themeStyles";
import { VideoComposition } from "../remotion/VideoComposition";

export interface VideoPreviewPanelProps {
  project: VideoProject;
  playerRef: React.RefObject<PlayerRef | null>;
  onExport: (resolution: ExportResolution) => Promise<void> | void;
  onCancelExport: () => void;
  isExporting: boolean;
  exportProgress: number;
  canExport: boolean;
  exportError: string | null;
}

function formatTime(frames: number, fps = 30): string {
  const totalSeconds = Math.max(0, Math.floor(frames / fps));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

export const VideoPreviewPanel: React.FC<VideoPreviewPanelProps> = ({
  project,
  playerRef,
  onExport,
  onCancelExport,
  isExporting,
  exportProgress,
  canExport,
  exportError,
}) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const [exportResolution, setExportResolution] = useState<ExportResolution>("720p");
  const volumeSliderId = useId();

  const containerRef = useRef<HTMLDivElement>(null);
  const aspectRatio = project.aspectRatio ?? "16:9";
  const { width, height } = getCanvasDimensions(aspectRatio);
  const isPortrait = aspectRatio === "9:16";

  const totalFrames = Math.max(
    1,
    project.totalDurationInFrames ||
      project.scenes.reduce((sum, s) => sum + s.durationInFrames, 0)
  );

  // Subscribe to Player EventEmitter
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const onFrameUpdate = (e: { detail: { frame: number } }) => {
      setCurrentFrame(e.detail.frame);
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentFrame(totalFrames);
    };
    const onMuteChange = (e: { detail: { isMuted: boolean } }) => {
      setIsMuted(e.detail.isMuted);
    };
    const onVolumeChange = (e: { detail: { volume: number } }) => {
      setVolume(e.detail.volume);
    };
    const onFullscreenChange = (e: { detail: { isFullscreen: boolean } }) => {
      setIsFullscreen(e.detail.isFullscreen);
    };

    player.addEventListener("frameupdate", onFrameUpdate);
    player.addEventListener("play", onPlay);
    player.addEventListener("pause", onPause);
    player.addEventListener("ended", onEnded);
    player.addEventListener("mutechange", onMuteChange);
    player.addEventListener("volumechange", onVolumeChange);
    player.addEventListener("fullscreenchange", onFullscreenChange);

    return () => {
      player.removeEventListener("frameupdate", onFrameUpdate);
      player.removeEventListener("play", onPlay);
      player.removeEventListener("pause", onPause);
      player.removeEventListener("ended", onEnded);
      player.removeEventListener("mutechange", onMuteChange);
      player.removeEventListener("volumechange", onVolumeChange);
      player.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, [playerRef, totalFrames]);

  // Handle Play/Pause toggle
  const handleTogglePlay = () => {
    const player = playerRef.current;
    if (!player) return;
    if (player.isPlaying()) {
      player.pause();
    } else {
      // Loop back if at the end
      if (currentFrame >= totalFrames - 1) {
        player.seekTo(0);
      }
      player.play();
    }
  };

  // Handle Timeline Scrubbing
  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetFrame = Number(e.target.value);
    setCurrentFrame(targetFrame);
    playerRef.current?.seekTo(targetFrame);
  };

  // Handle Restart
  const handleRestart = () => {
    playerRef.current?.seekTo(0);
    playerRef.current?.play();
  };

  // Handle Volume & Mute
  const handleToggleMute = () => {
    const player = playerRef.current;
    if (!player) return;
    if (player.isMuted()) {
      player.unmute();
      setIsMuted(false);
    } else {
      player.mute();
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = Number(e.target.value);
    setVolume(newVol);
    playerRef.current?.setVolume(newVol);
    if (newVol > 0 && isMuted) {
      playerRef.current?.unmute();
      setIsMuted(false);
    }
  };

  // Handle Fullscreen
  const handleFullscreen = () => {
    const player = playerRef.current;
    if (!player) return;
    if (player.isFullscreen()) {
      player.exitFullscreen();
    } else {
      player.requestFullscreen();
    }
  };

  // Handle Export trigger with success toast feedback
  const handleExportClick = async () => {
    setExportComplete(false);
    try {
      await onExport(exportResolution);
      setExportComplete(true);
      setTimeout(() => setExportComplete(false), 5000);
    } catch {
      // error handled in hook
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-5 shadow-xl backdrop-blur-md"
    >
      {/* Top Bar: Status, Stats & Export Actions */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-2.5 w-2.5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <h2 className="text-sm font-semibold tracking-wide text-zinc-100">
            Remotion Player Preview
          </h2>
          <span className="rounded-md border border-zinc-800 bg-zinc-950/80 px-2 py-0.5 text-[10px] font-mono font-medium text-zinc-400 shadow-sm">
            {width}×{height} <span className="text-zinc-600">|</span> {aspectRatio}
          </span>
        </div>

        {/* Action button: In-Browser Video Export */}
        <div className="flex items-center gap-2">
          {isExporting ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-950/50 px-3 py-1.5 text-xs font-semibold text-indigo-200 backdrop-blur-sm shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
                </span>
                <span>Exporting ({exportResolution.toUpperCase()}): {exportProgress}%</span>
              </div>
              <button
                type="button"
                onClick={onCancelExport}
                className="flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-950/40 px-2.5 py-1.5 text-xs font-medium text-rose-300 transition-all hover:bg-rose-900/60 active:scale-95 shadow-sm"
                title="Cancel export"
              >
                <XCircle className="h-3.5 w-3.5" />
                <span>Cancel</span>
              </button>
            </div>
          ) : exportComplete ? (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/60 px-3 py-1.5 text-xs font-semibold text-emerald-300 shadow-sm animate-in fade-in zoom-in-95 duration-200">
              <Check className="h-4 w-4 text-emerald-400" />
              <span>Downloaded ({exportResolution.toUpperCase()})!</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Fast 720p vs Studio 1080p Quality Switcher */}
              <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-950/80 p-0.5 text-[11px] font-medium text-zinc-400 shadow-inner">
                <button
                  type="button"
                  onClick={() => setExportResolution("720p")}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-all ${
                    exportResolution === "720p"
                      ? "bg-indigo-600 text-white font-semibold shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                  title="Fast Export 720p: 2.5x to 3x faster, 55.6% fewer pixels per frame"
                >
                  <Zap className="h-3 w-3 text-amber-300 fill-amber-300" />
                  <span>Fast 720p</span>
                </button>
                <button
                  type="button"
                  onClick={() => setExportResolution("1080p")}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-all ${
                    exportResolution === "1080p"
                      ? "bg-indigo-600 text-white font-semibold shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                  title="Studio Master 1080p: Full HD resolution"
                >
                  <span>Studio 1080p</span>
                </button>
              </div>

              {/* Download Trigger */}
              <button
                type="button"
                disabled={!canExport}
                onClick={handleExportClick}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-indigo-500 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
                title={
                  canExport
                    ? `Export ${exportResolution.toUpperCase()} MP4 via WebCodecs (${exportResolution === "720p" ? "Fast 2.5x-3x speed" : "Full HD master"})`
                    : "WebCodecs export unavailable in this browser"
                }
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download MP4</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Video Viewport Stage */}
      <div className="relative flex w-full items-center justify-center overflow-hidden rounded-xl border border-zinc-800/90 bg-[#05070B] p-2 min-h-[380px] shadow-inner">
        <div
          className="relative transition-all duration-300 ease-in-out flex items-center justify-center"
          style={{
            width: isPortrait ? "360px" : "100%",
            maxWidth: isPortrait ? "380px" : "100%",
            aspectRatio: isPortrait ? "9 / 16" : "16 / 9",
            maxHeight: isPortrait ? "640px" : "540px",
          }}
        >
          <Player
            ref={playerRef}
            component={VideoComposition}
            inputProps={project}
            durationInFrames={totalFrames}
            fps={30}
            compositionWidth={width}
            compositionHeight={height}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "0.5rem",
              overflow: "hidden",
            }}
            controls={false}
            loop={false}
          />
        </div>
      </div>

      {/* Transport & Controls Bar */}
      <div className="mt-4 flex flex-col gap-3 rounded-xl border border-zinc-800/80 bg-zinc-950/80 p-3.5 shadow-sm backdrop-blur-sm">
        {/* Timeline Scrubber Slider */}
        <div className="flex items-center gap-3">
          <span className="w-12 text-right font-mono text-xs font-medium text-zinc-300">
            {formatTime(currentFrame, 30)}
          </span>
          <input
            type="range"
            min={0}
            max={totalFrames}
            value={currentFrame}
            onChange={handleScrubberChange}
            aria-label="Timeline scrubber"
            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-lg bg-zinc-800 accent-indigo-500 transition-all hover:bg-zinc-700"
          />
          <span className="w-12 font-mono text-xs font-medium text-zinc-500">
            {formatTime(totalFrames, 30)}
          </span>
        </div>

        {/* Buttons Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          {/* Left: Playback toggles & Volume */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleTogglePlay}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm transition-all hover:bg-indigo-500 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 fill-white" />
              ) : (
                <Play className="h-4 w-4 fill-white ml-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={handleRestart}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/90 text-zinc-300 transition-all hover:border-zinc-700 hover:bg-zinc-800 hover:text-white active:scale-95 focus:outline-none"
              title="Restart from beginning"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-1.5 ml-2">
              <button
                type="button"
                onClick={handleToggleMute}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/90 text-zinc-300 transition-all hover:border-zinc-700 hover:bg-zinc-800 hover:text-white active:scale-95 focus:outline-none"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4 w-4 text-rose-400" />
                ) : (
                  <Volume2 className="h-4 w-4 text-indigo-400" />
                )}
              </button>
              <label htmlFor={volumeSliderId} className="sr-only">
                Playback volume
              </label>
              <input
                id={volumeSliderId}
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                aria-label="Volume slider"
                className="w-16 sm:w-20 h-1.5 cursor-pointer appearance-none rounded-lg bg-zinc-800 accent-indigo-500 hover:bg-zinc-700 transition-all"
              />
            </div>
          </div>

          {/* Right: Technical Stats Pill & Fullscreen */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 rounded-lg border border-zinc-800/90 bg-zinc-900/80 px-2.5 py-1 text-[11px] font-mono text-zinc-400 shadow-sm">
              Frame <span className="font-semibold text-indigo-400">{currentFrame}</span> /{" "}
              {totalFrames} <span className="text-zinc-600">·</span> 30 FPS
            </span>

            <button
              type="button"
              onClick={handleFullscreen}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/90 text-zinc-300 transition-all hover:border-zinc-700 hover:bg-zinc-800 hover:text-white active:scale-95 focus:outline-none"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Export In-Progress Meter (Secondary Detailed Feedback) */}
      {isExporting && (
        <div className="mt-3 flex flex-col gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-950/30 p-3 shadow-inner">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 font-medium text-indigo-200">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
              </span>
              Encoding MP4 via WebCodecs ({exportResolution.toUpperCase()})...
            </span>
            <span className="font-mono font-semibold text-indigo-300">{exportProgress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800/80">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-200 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, exportProgress))}%` }}
            />
          </div>
        </div>
      )}

      {/* Export Error Alert (if any) */}
      {exportError && (
        <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-rose-500/40 bg-rose-950/40 p-3 text-xs text-rose-200 shadow-sm">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-rose-300">Export Issue</p>
            <p className="mt-0.5 text-rose-200/90 leading-relaxed">{exportError}</p>
          </div>
        </div>
      )}

      {/* WebCodecs Capability Notice / Studio Footer */}
      {!canExport ? (
        <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-amber-500/40 bg-amber-950/30 p-3 text-xs text-amber-200">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="font-semibold text-amber-300">Client-Side Export Notice:</strong> In-browser video rendering
            requires WebCodecs API support. For optimal rendering, please run
            in <strong className="text-zinc-100">Google Chrome</strong> or <strong className="text-zinc-100">Microsoft Edge</strong>.
          </p>
        </div>
      ) : (
        <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500">
          <span className="flex items-center gap-1.5">
            <Info className="h-3 w-3 text-indigo-400" />
            <span>
              Client-Side WebCodecs Video Export Active (Zero Server FFmpeg)
            </span>
          </span>
          <span className="hidden md:inline-flex items-center gap-1 font-medium text-zinc-400">
            <Sparkles className="h-3 w-3 text-indigo-400" />
            <span>VidyaMotion AI Studio</span>
          </span>
        </div>
      )}
    </div>
  );
};
