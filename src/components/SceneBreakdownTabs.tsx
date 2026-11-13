import {
  AlertTriangle,
  Check,
  Clock,
  Code2,
  Copy,
  Edit3,
  FileText,
  Layers,
  Loader2,
  Mic,
  PlayCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import React, { useId, useMemo, useState } from "react";
import type { VideoProject } from "../remotion/types";
import { resolveLucideIcon } from "../remotion/utils/themeStyles";

export interface SceneBreakdownTabsProps {
  project: VideoProject;
  onUpdateHeading: (sceneId: string, newHeading: string) => void;
  onUpdateIcon: (sceneId: string, newIcon: string) => void;
  onSeekToScene?: (startFrame: number) => void;
  onRegenerateScene?: (sceneId: string, instruction?: string) => Promise<boolean>;
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

export const SceneBreakdownTabs: React.FC<SceneBreakdownTabsProps> = ({
  project,
  onUpdateHeading,
  onUpdateIcon,
  onSeekToScene,
  onRegenerateScene,
}) => {
  const [activeTab, setActiveTab] = useState<"breakdown" | "transcript" | "code">(
    "breakdown"
  );
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedSceneId, setCopiedSceneId] = useState<string | null>(null);
  const [copiedCodeSceneId, setCopiedCodeSceneId] = useState<string | null>(null);
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [iconPickerSceneId, setIconPickerSceneId] = useState<string | null>(null);
  const [selectedCodeSceneId, setSelectedCodeSceneId] = useState<string>(
    project.scenes[0]?.id || ""
  );

  // Per-scene regeneration instruction state
  const [regeneratingSceneId, setRegeneratingSceneId] = useState<string | null>(null);
  const [showPromptBoxSceneId, setShowPromptBoxSceneId] = useState<string | null>(null);
  const [customInstructions, setCustomInstructions] = useState<Record<string, string>>({});

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
          `[Scene ${i + 1}: ${s.heading}]\n${s.narrationScript}`
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

  const handleCopyCode = async (sceneId: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodeSceneId(sceneId);
      setTimeout(() => setCopiedCodeSceneId(null), 2000);
    } catch (err) {
      console.warn("Failed to copy code:", err);
    }
  };

  const handleRegenerate = async (sceneId: string) => {
    if (!onRegenerateScene) return;
    const instruction = customInstructions[sceneId]?.trim() || undefined;
    setRegeneratingSceneId(sceneId);
    try {
      await onRegenerateScene(sceneId, instruction);
      setShowPromptBoxSceneId(null);
    } finally {
      setRegeneratingSceneId(null);
    }
  };

  const activeCodeScene = useMemo(() => {
    return (
      project.scenes.find((s) => s.id === selectedCodeSceneId) ||
      project.scenes[0]
    );
  }, [project.scenes, selectedCodeSceneId]);

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
                ? "border border-indigo-500/40 bg-indigo-950/60 text-indigo-300 shadow-sm"
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
                ? "border border-indigo-500/40 bg-indigo-950/60 text-indigo-300 shadow-sm"
                : "border border-transparent text-slate-400 hover:bg-slate-800/70 hover:text-slate-200"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Voiceover Transcript</span>
            <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[10px] text-slate-400">
              {totalWords} words
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("code");
              if (!selectedCodeSceneId && project.scenes[0]) {
                setSelectedCodeSceneId(project.scenes[0].id);
              }
            }}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "code"
                ? "border border-indigo-500/40 bg-indigo-950/60 text-indigo-300 shadow-sm"
                : "border border-transparent text-slate-400 hover:bg-slate-800/70 hover:text-slate-200"
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            <span>View Generated Code</span>
            <span className="rounded bg-indigo-950/80 border border-indigo-800/50 px-1.5 py-0.2 text-[10px] text-indigo-300 font-mono">
              AI TSX
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
              💡 Each scene is coded dynamically in Remotion TSX. Click title to edit, or Regenerate to rewrite with custom AI instructions.
            </span>
            <span className="font-mono text-indigo-400">
              Total: {Math.round(project.totalDurationInFrames / 30)}s ({project.totalDurationInFrames} frames)
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {sceneTimeline.map(({ scene, index, fromFrame, durationInFrames, durationInSeconds }) => {
              const IconComponent = resolveLucideIcon(scene.iconName);
              const isEditing = editingSceneId === scene.id;
              const isPickingIcon = iconPickerSceneId === scene.id;
              const isRegenerating = regeneratingSceneId === scene.id;
              const showPromptBox = showPromptBoxSceneId === scene.id;

              return (
                <div
                  key={scene.id}
                  className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 transition-all hover:border-slate-700 hover:bg-slate-950/90"
                >
                  {/* Top row: Badges, jump button, duration, Regenerate button */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 font-mono text-[10px] font-bold text-slate-300">
                        {index + 1}
                      </span>

                      {/* Model Badge */}
                      <span className="flex items-center gap-1 rounded-md border border-indigo-500/30 bg-indigo-950/60 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
                        <Sparkles className="h-2.5 w-2.5 text-indigo-400" />
                        <span>{scene.modelUsed || "gemini-3.8-flash"}</span>
                      </span>

                      {/* Correction Status Badge */}
                      {scene.isCorrected && (
                        <span className="rounded-md border border-emerald-500/30 bg-emerald-950/60 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                          ✓ Corrected
                        </span>
                      )}

                      {/* Placeholder Fallback Status */}
                      {scene.isPlaceholder && (
                        <span className="flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-950/60 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300">
                          <AlertTriangle className="h-2.5 w-2.5 text-amber-400" />
                          <span>Fallback Card</span>
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
                          className="flex items-center gap-1 rounded-md border border-slate-800 bg-slate-900 px-2 py-0.5 text-[10px] font-medium text-indigo-300 hover:border-indigo-500/50 hover:bg-indigo-950/40"
                          title={`Jump to frame ${fromFrame}`}
                        >
                          <PlayCircle className="h-3 w-3" />
                          <span>Jump</span>
                        </button>
                      )}

                      {/* Regenerate Button */}
                      {onRegenerateScene && (
                        <button
                          type="button"
                          onClick={() =>
                            setShowPromptBoxSceneId(showPromptBox ? null : scene.id)
                          }
                          disabled={isRegenerating}
                          className="flex items-center gap-1 rounded-md border border-slate-800 bg-slate-900 px-2.5 py-0.5 text-[10px] font-semibold text-slate-300 hover:border-indigo-500 hover:text-white transition-all disabled:opacity-50"
                        >
                          {isRegenerating ? (
                            <Loader2 className="h-3 w-3 animate-spin text-indigo-400" />
                          ) : (
                            <RefreshCw className="h-3 w-3 text-indigo-400" />
                          )}
                          <span>{isRegenerating ? "Coding..." : "Regenerate"}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expandable Regeneration Instruction Box */}
                  {showPromptBox && (
                    <div className="mt-1 flex flex-col gap-2 rounded-lg border border-indigo-900/60 bg-indigo-950/30 p-2.5">
                      <div className="text-[11px] font-medium text-indigo-300">
                        Regeneration Instruction (Optional):
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. make the diagram bigger, show chemical bonds, add step numbers..."
                          value={customInstructions[scene.id] || ""}
                          onChange={(e) =>
                            setCustomInstructions({
                              ...customInstructions,
                              [scene.id]: e.target.value,
                            })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleRegenerate(scene.id);
                            }
                          }}
                          className="flex-1 rounded-md border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleRegenerate(scene.id)}
                          disabled={isRegenerating}
                          className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                        >
                          {isRegenerating ? "Generating..." : "Generate Code"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Middle row: Icon, editable title */}
                  <div className="flex items-start gap-3 mt-1">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setIconPickerSceneId(isPickingIcon ? null : scene.id)
                        }
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 p-2 text-indigo-400 transition-all hover:border-indigo-400 hover:scale-105"
                        title="Click to swap Lucide icon"
                      >
                        <IconComponent className="h-5 w-5" />
                      </button>

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
                                      ? "bg-indigo-600 text-white"
                                      : "text-slate-300 hover:bg-slate-800 hover:text-indigo-400"
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
                            className="w-full rounded-lg border border-indigo-500 bg-slate-950 px-2.5 py-1 text-sm font-semibold text-white focus:outline-none"
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
                          <h3 className="text-sm font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
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

                      {/* Visual Brief Display */}
                      {scene.visualBrief && (
                        <div className="mt-2 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs text-slate-300">
                          <span className="font-semibold text-indigo-400">Visual Plan: </span>
                          <span className="italic">{scene.visualBrief}</span>
                        </div>
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
          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/80 px-3.5 py-2 text-xs">
            <div className="flex items-center gap-2">
              <Mic className="h-3.5 w-3.5 text-indigo-400" />
              <span className="text-slate-300">Active Edge-TTS Neural Voice:</span>
              <span className="font-semibold text-indigo-300">
                {VOICE_INFO[project.language] || project.language}
              </span>
            </div>
            <span className="font-mono text-slate-400 text-[11px]">
              {totalWords} total words
            </span>
          </div>

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
                        className="rounded p-1 text-slate-400 hover:text-indigo-300"
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

                  <p className="text-xs leading-relaxed text-slate-300 font-sans">
                    {scene.narrationScript}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: View Generated Code */}
      {activeTab === "code" && (
        <div className="mt-4 flex flex-col gap-3">
          {/* Scene selector sub-bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {project.scenes.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedCodeSceneId(s.id)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                    activeCodeScene?.id === s.id
                      ? "bg-indigo-600 text-white font-semibold shadow"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  Scene {idx + 1}
                </button>
              ))}
            </div>

            {activeCodeScene && (
              <button
                type="button"
                onClick={() =>
                  handleCopyCode(activeCodeScene.id, activeCodeScene.code || "")
                }
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-slate-300 hover:text-white transition-all"
              >
                {copiedCodeSceneId === activeCodeScene.id ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-300">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy TSX</span>
                  </>
                )}
              </button>
            )}
          </div>

          {activeCodeScene ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  Component for: <strong className="text-slate-200">{activeCodeScene.heading}</strong>
                </span>
                <span className="font-mono text-[11px] text-indigo-400">
                  Model: {activeCodeScene.modelUsed || "AI Generated"} ·{" "}
                  {activeCodeScene.code ? `${activeCodeScene.code.length} chars` : "0 chars"}
                </span>
              </div>

              {activeCodeScene.code ? (
                <pre className="max-h-96 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300 leading-relaxed">
                  <code>{activeCodeScene.code}</code>
                </pre>
              ) : (
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 text-center text-xs text-slate-500">
                  No custom TSX code generated yet for this scene (currently running in fallback mode).
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-slate-500">No scenes available.</div>
          )}
        </div>
      )}
    </div>
  );
};
