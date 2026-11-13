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
} from "lucide-react";
import React, { useEffect, useId, useRef, useState } from "react";
import type { VideoProject } from "../remotion/types";
import { getCanvasDimensions } from "../remotion/utils/themeStyles";
import { VideoComposition } from "../remotion/VideoComposition";

export interface VideoPreviewPanelProps {
  project: VideoProject;
  playerRef: React.RefObject<PlayerRef | null>;
  onExport: () => Promise<void>;
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
      await onExport();
      setExportComplete(true);
      setTimeout(() => setExportComplete(false), 5000);
    } catch {
      // error handled in hook
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-md"
    >
      {/* Top Bar: Title & Stats */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <h2 className="text-sm font-semibold tracking-wide text-white">
            Remotion Player Preview
          </h2>
          <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-indigo-300">
            {width}x{height} ({aspectRatio})
          </span>
        </div>

        {/* Action button: In-Browser Video Export */}
        <div className="flex items-center gap-2">
          {isExporting ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-xl border border-indigo-500/50 bg-indigo-950/60 px-3 py-1.5 text-xs font-semibold text-indigo-200">
                <span className="h-2 w-2 rounded-full bg-indigo-400 animate-ping" />
                <span>Exporting MP4: {exportProgress}%</span>
              </div>
              <button
                type="button"
                onClick={onCancelExport}
                className="flex items-center gap-1 rounded-xl border border-rose-500/40 bg-rose-950/40 px-2.5 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-900/60"
                title="Cancel export"
              >
                <XCircle className="h-3.5 w-3.5" />
                <span>Cancel</span>
              </button>
            </div>
          ) : exportComplete ? (
            <div className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/60 px-3 py-1.5 text-xs font-semibold text-emerald-300">
              <Check className="h-4 w-4 text-emerald-400" />
              <span>Downloaded!</span>
            </div>
          ) : (
            <button
              type="button"
              disabled={!canExport}
              onClick={handleExportClick}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-indigo-500 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
              title={
                canExport
                  ? "Export full video with voiceover & karaoke captions entirely inside your browser via WebCodecs"
                  : "WebCodecs export unavailable in this browser"
              }
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Video (.mp4)</span>
            </button>
          )}
        </div>
      </div>

      {/* Video Viewport Stage */}
      <div className="relative flex w-full items-center justify-center overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-2 min-h-[380px]">
        <div
          className="relative transition-all duration-300 ease-in-out"
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

      {/* Sibling Custom Playback Controls & Scrubber */}
      <div className="mt-4 flex flex-col gap-2.5 rounded-xl border border-slate-800 bg-slate-950/90 p-3">
        {/* Timeline Scrubber Slider */}
        <div className="flex items-center gap-3">
          <span className="w-12 font-mono text-xs text-slate-300 text-right">
            {formatTime(currentFrame, 30)}
          </span>
          <input
            type="range"
            min={0}
            max={totalFrames}
            value={currentFrame}
            onChange={handleScrubberChange}
            aria-label="Timeline scrubber"
            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-lg bg-slate-800 accent-indigo-500 transition-all hover:bg-slate-700"
          />
          <span className="w-12 font-mono text-xs text-slate-500">
            {formatTime(totalFrames, 30)}
          </span>
        </div>

        {/* Buttons Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          {/* Left: Playback toggles */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleTogglePlay}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white transition-all hover:bg-indigo-500 active:scale-95 shadow-sm"
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
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:text-white"
              title="Restart from beginning"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-1.5 ml-2">
              <button
                type="button"
                onClick={handleToggleMute}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:text-white"
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
                className="w-16 h-1 cursor-pointer appearance-none rounded-lg bg-slate-800 accent-indigo-500"
              />
            </div>
          </div>

          {/* Right: Technical Stats Pill & Fullscreen */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline rounded-md border border-slate-800 bg-slate-900 px-2.5 py-1 text-[11px] font-mono text-slate-400">
              Frame: <span className="text-indigo-300">{currentFrame}</span> /{" "}
              {totalFrames} · 30 FPS
            </span>

            <button
              type="button"
              onClick={handleFullscreen}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:text-white"
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

      {/* Export Error Alert (if any) */}
      {exportError && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose-500/40 bg-rose-950/40 p-3 text-xs text-rose-200">
          <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-rose-300">Export Issue</p>
            <p className="mt-0.5 text-rose-200/90 leading-relaxed">{exportError}</p>
          </div>
        </div>
      )}

      {/* WebCodecs Capability Notice */}
      {!canExport ? (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-950/30 p-3 text-xs text-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Client-Side Export Notice:</strong> In-browser video rendering
            requires WebCodecs API support. For optimal rendering, please run
            in <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong>.
          </p>
        </div>
      ) : (
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <Info className="h-3 w-3 text-indigo-400" />
            <span>
              Client-Side WebCodecs Video Export Active (Zero Server FFmpeg)
            </span>
          </span>
          <span className="hidden md:inline font-medium text-slate-400">
            <Sparkles className="h-3 w-3 inline mr-1 text-indigo-400" />
            VidyaMotion AI Studio
          </span>
        </div>
      )}
    </div>
  );
};
