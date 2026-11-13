import {
  Check,
  ChevronRight,
  Clock,
  Copy,
  Edit3,
  FileText,
  Layers,
  Mic,
  PlayCircle,
} from "lucide-react";
import React, { useId, useMemo, useState } from "react";
import type { VideoProject } from "../remotion/types";
import { resolveLucideIcon } from "../remotion/utils/themeStyles";

export interface SceneBreakdownTabsProps {
  project: VideoProject;
  onUpdateHeading: (sceneId: string, newHeading: string) => void;
  onUpdateIcon: (sceneId: string, newIcon: string) => void;
  onSeekToScene?: (startFrame: number) => void;
}

const POPULAR_ICONS = [
  "Sparkles",
  "Sun",
  "Cpu",
  "Zap",
  "Network",
  "Dna",
  "Rocket",
  "Brain",
  "Atom",
  "Leaf",
  "Database",
  "Shield",
  "BookOpen",
  "Code2",
  "Layers",
  "Globe",
  "CheckCircle2",
  "Workflow",
  "Activity",
  "Flame",
  "Calculator",
  "BarChart3",
  "Terminal",
  "Lightbulb",
];

const VOICE_INFO: Record<string, string> = {
  "en-IN": "en-IN-NeerjaNeural (Neural Indian English)",
  "hi-IN": "hi-IN-SwaraNeural (Neural Hindi)",
  "gu-IN": "gu-IN-DhwaniNeural (Neural Gujarati)",
  "en-US": "en-US-JennyNeural (Neural US English)",
};

const SCENE_TYPE_BADGES: Record<string, { label: string; color: string }> = {
  TITLE_HERO: {
    label: "Title Hero",
    color: "bg-cyan-950/60 text-cyan-300 border-cyan-500/30",
  },
  SPLIT_EXPLAINER: {
    label: "Split Explainer",
    color: "bg-blue-950/60 text-blue-300 border-blue-500/30",
  },
  KEY_METRIC_OR_FACT: {
    label: "Key Metric / Fact",
    color: "bg-amber-950/60 text-amber-300 border-amber-500/30",
  },
  STEP_BY_STEP_FLOW: {
    label: "Step-by-Step Flow",
    color: "bg-violet-950/60 text-violet-300 border-violet-500/30",
  },
  SUMMARY_TAKEAWAY: {
    label: "Summary Takeaway",
    color: "bg-emerald-950/60 text-emerald-300 border-emerald-500/30",
  },
};

export const SceneBreakdownTabs: React.FC<SceneBreakdownTabsProps> = ({
  project,
  onUpdateHeading,
  onUpdateIcon,
  onSeekToScene,
}) => {
  const [activeTab, setActiveTab] = useState<"breakdown" | "transcript">(
    "breakdown"
  );
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedSceneId, setCopiedSceneId] = useState<string | null>(null);
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [iconPickerSceneId, setIconPickerSceneId] = useState<string | null>(
    null
  );
  const headingInputIdPrefix = useId();

  // Compute start frames for each scene sequentially
  const sceneTimeline = useMemo(() => {
    let offset = 0;
    return project.scenes.map((scene, idx) => {
      const from = offset;
      const duration = scene.durationInFrames || 150;
      offset += duration;
      return {
        scene,
        index: idx,
        fromFrame: from,
        durationInFrames: duration,
        durationInSeconds: (duration / 30).toFixed(1),
      };
    });
  }, [project.scenes]);

  const totalWords = useMemo(() => {
    return project.scenes.reduce((acc, s) => {
      const words = s.narrationScript.trim().split(/\s+/).filter(Boolean).length;
      return acc + words;
    }, 0);
  }, [project.scenes]);

  const handleCopyAll = async () => {
    const fullScript = project.scenes
      .map(
        (s, i) =>
          `[Scene ${i + 1}: ${s.heading} (${s.type})]\n${s.narrationScript}`
      )
      .join("\n\n");

    try {
      await navigator.clipboard.writeText(fullScript);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2500);
    } catch (err) {
      console.warn("Failed to copy transcript:", err);
    }
  };

  const handleCopyScene = async (sceneId: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSceneId(sceneId);
      setTimeout(() => setCopiedSceneId(null), 2000);
    } catch (err) {
      console.warn("Failed to copy scene:", err);
    }
  };

  return (
    <div className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-md">
      {/* Tabs navigation bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("breakdown")}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "breakdown"
                ? "border border-cyan-500/40 bg-cyan-950/60 text-cyan-300 shadow-sm shadow-cyan-500/10"
                : "border border-transparent text-slate-400 hover:bg-slate-800/70 hover:text-slate-200"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Scene Breakdown ({project.scenes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("transcript")}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "transcript"
                ? "border border-cyan-500/40 bg-cyan-950/60 text-cyan-300 shadow-sm shadow-cyan-500/10"
                : "border border-transparent text-slate-400 hover:bg-slate-800/70 hover:text-slate-200"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Narration Transcript</span>
            <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[10px] text-slate-400">
              {totalWords} words
            </span>
          </button>
        </div>

        {activeTab === "transcript" && (
          <button
            type="button"
            onClick={handleCopyAll}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-white transition-all active:scale-95"
          >
            {copiedAll ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-300">Transcript Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-400" />
                <span>Copy Full Transcript</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Tab 1: Scene Breakdown */}
      {activeTab === "breakdown" && (
        <div className="mt-4 flex flex-col gap-3">
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>
              💡 Click any scene title to edit live, swap icons, or jump to its start frame in the player.
            </span>
            <span className="font-mono text-cyan-400">
              Total: {Math.round(project.totalDurationInFrames / 30)}s (
              {project.totalDurationInFrames} frames)
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {sceneTimeline.map(({ scene, index, fromFrame, durationInFrames, durationInSeconds }) => {
              const IconComponent = resolveLucideIcon(scene.iconName);
              const badge = (scene.type ? SCENE_TYPE_BADGES[scene.type] : undefined) || {
                label: scene.type || "AI Scene",
                color: "bg-slate-800 text-slate-300 border-slate-700",
              };
              const isEditing = editingSceneId === scene.id;
              const isPickingIcon = iconPickerSceneId === scene.id;

              return (
                <div
                  key={scene.id}
                  className="flex flex-col gap-2 rounded-xl border border-slate-800/80 bg-slate-950/70 p-3.5 transition-all hover:border-slate-700 hover:bg-slate-950/90"
                >
                  {/* Top row: Badges, jump button, duration */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 font-mono text-[10px] font-bold text-slate-300">
                        {index + 1}
                      </span>
                      <span
                        className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                      {scene.highlightWord && (
                        <span className="rounded bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-mono text-amber-300">
                          Key: {scene.highlightWord}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                        <Clock className="h-3 w-3 text-slate-500" />
                        {durationInSeconds}s ({durationInFrames}f)
                      </span>

                      {onSeekToScene && (
                        <button
                          type="button"
                          onClick={() => onSeekToScene(fromFrame)}
                          className="flex items-center gap-1 rounded-md border border-slate-800 bg-slate-900 px-2 py-0.5 text-[10px] font-medium text-cyan-300 hover:border-cyan-500/50 hover:bg-cyan-950/40"
                          title={`Jump to frame ${fromFrame}`}
                        >
                          <PlayCircle className="h-3 w-3" />
                          <span>Jump @ {fromFrame}f</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Middle row: Icon, editable title */}
                  <div className="flex items-start gap-3 mt-1">
                    {/* Icon Trigger / Selector */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setIconPickerSceneId(isPickingIcon ? null : scene.id)
                        }
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 p-2 text-cyan-400 transition-all hover:border-cyan-400 hover:scale-105"
                        title="Click to swap Lucide icon"
                      >
                        <IconComponent className="h-5 w-5" />
                      </button>

                      {/* Icon Picker Popover */}
                      {isPickingIcon && (
                        <div className="absolute left-0 top-12 z-50 w-64 rounded-xl border border-slate-800 bg-slate-900 p-2.5 shadow-2xl backdrop-blur-xl">
                          <div className="mb-2 text-[10px] font-semibold uppercase text-slate-400">
                            Select Scene Icon
                          </div>
                          <div className="grid grid-cols-6 gap-1.5">
                            {POPULAR_ICONS.map((iconName) => {
                              const Candidate = resolveLucideIcon(iconName);
                              return (
                                <button
                                  key={iconName}
                                  type="button"
                                  onClick={() => {
                                    onUpdateIcon(scene.id, iconName);
                                    setIconPickerSceneId(null);
                                  }}
                                  className={`flex h-8 w-8 items-center justify-center rounded-lg p-1.5 transition-all ${
                                    scene.iconName === iconName
                                      ? "bg-cyan-500 text-slate-950"
                                      : "text-slate-300 hover:bg-slate-800 hover:text-cyan-400"
                                  }`}
                                  title={iconName}
                                >
                                  <Candidate className="h-4 w-4" />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Heading (inline editable) */}
                    <div className="flex-1">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <label htmlFor={`${headingInputIdPrefix}-${scene.id}`} className="sr-only">
                            Scene Heading
                          </label>
                          <input
                            id={`${headingInputIdPrefix}-${scene.id}`}
                            type="text"
                            defaultValue={scene.heading}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                onUpdateHeading(
                                  scene.id,
                                  (e.target as HTMLInputElement).value
                                );
                                setEditingSceneId(null);
                              } else if (e.key === "Escape") {
                                setEditingSceneId(null);
                              }
                            }}
                            onBlur={(e) => {
                              onUpdateHeading(scene.id, e.target.value);
                              setEditingSceneId(null);
                            }}
                            className="w-full rounded-lg border border-cyan-500 bg-slate-950 px-2.5 py-1 text-sm font-semibold text-white focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setEditingSceneId(null)}
                            className="rounded p-1 text-xs text-slate-400 hover:text-white"
                          >
                            Done
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => setEditingSceneId(scene.id)}
                          className="group flex cursor-pointer items-center gap-1.5"
                          title="Click to edit headline live"
                        >
                          <h3 className="text-sm font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                            {scene.heading}
                          </h3>
                          <Edit3 className="h-3 w-3 text-slate-500 opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                      )}

                      {scene.subtext && (
                        <p className="mt-0.5 text-xs text-slate-400">
                          {scene.subtext}
                        </p>
                      )}

                      {/* Bullet points (if any) */}
                      {scene.bulletPoints && scene.bulletPoints.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {scene.bulletPoints.map((pt, pIdx) => (
                            <li
                              key={pIdx}
                              className="flex items-center gap-1.5 text-xs text-slate-300"
                            >
                              <ChevronRight className="h-3 w-3 text-cyan-400 shrink-0" />
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Narration Transcript */}
      {activeTab === "transcript" && (
        <div className="mt-4 flex flex-col gap-3">
          {/* Accent and Voice pill */}
          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/80 px-3.5 py-2 text-xs">
            <div className="flex items-center gap-2">
              <Mic className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-slate-300">
                Active Edge-TTS Neural Voice:
              </span>
              <span className="font-semibold text-cyan-300">
                {VOICE_INFO[project.language] || project.language}
              </span>
            </div>
            <span className="font-mono text-slate-400 text-[11px]">
              {totalWords} total words
            </span>
          </div>

          {/* Transcript cards */}
          <div className="space-y-3">
            {project.scenes.map((scene, idx) => {
              const wordCount = scene.narrationScript
                .trim()
                .split(/\s+/)
                .filter(Boolean).length;
              const isCopied = copiedSceneId === scene.id;

              return (
                <div
                  key={scene.id}
                  className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-3.5"
                >
                  <div className="flex items-center justify-between border-b border-slate-800/60 pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-300">
                        Scene {idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-slate-200">
                        {scene.heading}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-mono">
                        {wordCount} words · {Math.round(scene.durationInFrames / 30)}s
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyScene(scene.id, scene.narrationScript)
                        }
                        className="rounded p-1 text-slate-400 hover:text-cyan-300"
                        title="Copy scene narration script"
                      >
                        {isCopied ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed text-slate-300/90 whitespace-pre-line font-normal">
                    {scene.narrationScript}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
