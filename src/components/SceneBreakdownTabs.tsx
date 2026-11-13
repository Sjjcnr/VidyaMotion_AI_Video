import {
  AlertTriangle,
  Check,
  ChevronRight,
  Clock,
  Code2,
  Copy,
  Edit3,
  Eye,
  FileCode,
  Layers,
  Loader2,
  Mic,
  PlayCircle,
  RefreshCw,
  Sparkles,
  Terminal,
  Wand2,
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
  "en-IN": "Neerja Neural (Indian English)",
  "hi-IN": "Swara Neural (Hindi)",
  "gu-IN": "Dhwani Neural (Gujarati)",
  "en-US": "Jenny Neural (US English)",
};

const PROMPT_SUGGESTIONS = [
  "Make the diagram bigger and centered with glowing high-contrast lines",
  "Explain with a clean 3-step animated flow chart and arrow connectors",
  "Use vibrant neon accents and highlight key metrics with large animated counters",
  "Show a cyclical feedback loop animation with smooth rotating nodes",
  "Focus on technical architecture schematic with clear labeled callouts",
  "Add molecular / particle structure visual with pulsing connections",
];

export const SceneBreakdownTabs: React.FC<SceneBreakdownTabsProps> = ({
  project,
  onUpdateHeading,
  onUpdateIcon,
  onSeekToScene,
  onRegenerateScene,
}) => {
  const [activeTab, setActiveTab] = useState<"breakdown" | "code" | "regenerate">(
    "breakdown"
  );
  const [selectedCodeSceneId, setSelectedCodeSceneId] = useState<string>(
    project.scenes[0]?.id || ""
  );
  const [selectedRegenSceneId, setSelectedRegenSceneId] = useState<string>(
    project.scenes[0]?.id || ""
  );

  // Copy feedback states
  const [copiedCodeToast, setCopiedCodeToast] = useState(false);
  const [copiedSceneNarrationId, setCopiedSceneNarrationId] = useState<string | null>(null);
  const [copiedFullScript, setCopiedFullScript] = useState(false);

  // Inline editing state
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [iconPickerSceneId, setIconPickerSceneId] = useState<string | null>(null);

  // Regeneration states
  const [regeneratingSceneId, setRegeneratingSceneId] = useState<string | null>(null);
  const [customInstructions, setCustomInstructions] = useState<Record<string, string>>({});
  const [regenSuccessSceneId, setRegenSuccessSceneId] = useState<string | null>(null);

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

  const activeCodeScene = useMemo(() => {
    return (
      project.scenes.find((s) => s.id === selectedCodeSceneId) ||
      project.scenes[0]
    );
  }, [project.scenes, selectedCodeSceneId]);

  const activeRegenScene = useMemo(() => {
    return (
      project.scenes.find((s) => s.id === selectedRegenSceneId) ||
      project.scenes[0]
    );
  }, [project.scenes, selectedRegenSceneId]);

  const activeRegenSceneIndex = useMemo(() => {
    const idx = project.scenes.findIndex((s) => s.id === activeRegenScene?.id);
    return idx >= 0 ? idx : 0;
  }, [project.scenes, activeRegenScene]);

  const activeCodeLines = useMemo(() => {
    if (!activeCodeScene?.code) return [];
    return activeCodeScene.code.split("\n");
  }, [activeCodeScene?.code]);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodeToast(true);
      setTimeout(() => setCopiedCodeToast(false), 2000);
    } catch (err) {
      console.warn("Failed to copy code:", err);
    }
  };

  const handleCopyNarration = async (sceneId: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSceneNarrationId(sceneId);
      setTimeout(() => setCopiedSceneNarrationId(null), 2000);
    } catch (err) {
      console.warn("Failed to copy scene narration:", err);
    }
  };

  const handleCopyFullScript = async () => {
    const fullScript = project.scenes
      .map((s, i) => `[Scene ${i + 1}: ${s.heading}]\n${s.narrationScript}`)
      .join("\n\n");

    try {
      await navigator.clipboard.writeText(fullScript);
      setCopiedFullScript(true);
      setTimeout(() => setCopiedFullScript(false), 2500);
    } catch (err) {
      console.warn("Failed to copy transcript:", err);
    }
  };

  const handleRegenerate = async (sceneId: string) => {
    if (!onRegenerateScene) return;
    const instruction = customInstructions[sceneId]?.trim() || undefined;
    setRegeneratingSceneId(sceneId);
    setRegenSuccessSceneId(null);
    try {
      const success = await onRegenerateScene(sceneId, instruction);
      if (success) {
        setRegenSuccessSceneId(sceneId);
        setTimeout(() => setRegenSuccessSceneId(null), 4000);
      }
    } finally {
      setRegeneratingSceneId(null);
    }
  };

  const handleApplySuggestion = (sceneId: string, suggestion: string) => {
    setCustomInstructions((prev) => ({
      ...prev,
      [sceneId]: suggestion,
    }));
  };

  return (
    <div className="flex flex-col rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-5 shadow-xl backdrop-blur-md">
      {/* 1. Tab Header: Segmented navigation bar with border-zinc-800, subtle active state, and scene counter badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
        <div className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-950/80 p-1 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab("breakdown")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "breakdown"
                ? "border border-zinc-700/60 bg-zinc-800/90 text-white shadow-sm"
                : "border border-transparent text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200"
            }`}
          >
            <Layers className="h-3.5 w-3.5 text-indigo-400" />
            <span>Scene Breakdown</span>
            <span className="rounded-md border border-zinc-700/50 bg-zinc-900/90 px-1.5 py-0.5 font-mono text-[10px] font-bold text-zinc-300">
              {project.scenes.length}
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
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "code"
                ? "border border-zinc-700/60 bg-zinc-800/90 text-white shadow-sm"
                : "border border-transparent text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200"
            }`}
          >
            <Code2 className="h-3.5 w-3.5 text-cyan-400" />
            <span>View Generated Code</span>
            <span className="rounded-md border border-cyan-800/50 bg-cyan-950/60 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-cyan-300">
              AI TSX
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("regenerate");
              if (!selectedRegenSceneId && project.scenes[0]) {
                setSelectedRegenSceneId(project.scenes[0].id);
              }
            }}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "regenerate"
                ? "border border-zinc-700/60 bg-zinc-800/90 text-white shadow-sm"
                : "border border-transparent text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200"
            }`}
          >
            <RefreshCw className="h-3.5 w-3.5 text-amber-400" />
            <span>Regenerate Scene</span>
            <span className="rounded-md border border-amber-800/40 bg-amber-950/50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-amber-300">
              Studio
            </span>
          </button>
        </div>

        {/* Right side stats & quick actions */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-1 font-mono text-xs text-zinc-400">
            <Clock className="h-3.5 w-3.5 text-zinc-500" />
            <span>
              {Math.round(project.totalDurationInFrames / 30)}s · {project.totalDurationInFrames}f
            </span>
          </span>

          {activeTab === "breakdown" && (
            <button
              type="button"
              onClick={handleCopyFullScript}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:border-zinc-700 hover:text-white transition-all active:scale-95"
              title="Copy all scene voiceover narration scripts"
            >
              {copiedFullScript ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Script Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Copy All Script</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 2. Tab 1: Scene Breakdown List */}
      {activeTab === "breakdown" && (
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400">
            <span>
              💡 Each scene runs bespoke Remotion TSX. Click headline to edit inline, or seek directly to timeline frame.
            </span>
            <span className="flex items-center gap-1 font-mono text-zinc-400">
              <Mic className="h-3 w-3 text-indigo-400" />
              <span>Voice: {VOICE_INFO[project.language] || project.language} ({totalWords} words)</span>
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {sceneTimeline.map(({ scene, index, fromFrame, durationInFrames, durationInSeconds }) => {
              const IconComponent = resolveLucideIcon(scene.iconName);
              const isEditing = editingSceneId === scene.id;
              const isPickingIcon = iconPickerSceneId === scene.id;
              const stepNumber = String(index + 1).padStart(2, "0");
              const isNarrationCopied = copiedSceneNarrationId === scene.id;

              return (
                <div
                  key={scene.id}
                  className="group relative flex flex-col gap-3 rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-4 transition-all hover:border-zinc-700 hover:bg-zinc-950/90 shadow-sm"
                >
                  {/* Top row: step number, badges, duration & actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {/* Step Number Badge */}
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 font-mono text-xs font-bold text-zinc-200 shadow-inner">
                        {stepNumber}
                      </span>

                      {/* Model Badge */}
                      <span className="flex items-center gap-1 rounded-full border border-indigo-500/25 bg-indigo-950/40 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
                        <Sparkles className="h-2.5 w-2.5 text-indigo-400" />
                        <span>{scene.modelUsed || "gemini-2.5-flash"}</span>
                      </span>

                      {/* Correction Status Badge */}
                      {scene.isCorrected && (
                        <span className="rounded-full border border-emerald-500/30 bg-emerald-950/50 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                          ✓ Auto-Corrected
                        </span>
                      )}

                      {/* Placeholder Fallback Status */}
                      {scene.isPlaceholder && (
                        <span className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-950/50 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                          <AlertTriangle className="h-2.5 w-2.5 text-amber-400" />
                          <span>Fallback Card</span>
                        </span>
                      )}

                      {/* TSX Code Status */}
                      {scene.code ? (
                        <span className="hidden sm:inline-flex rounded-full border border-zinc-800 bg-zinc-900/80 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
                          TSX Active
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Duration readout */}
                      <span className="flex items-center gap-1 font-mono text-xs text-zinc-400">
                        <Clock className="h-3 w-3 text-zinc-500" />
                        <span>{durationInSeconds}s ({durationInFrames}f)</span>
                      </span>

                      {/* Seek to Scene Button with smooth hover */}
                      {onSeekToScene && (
                        <button
                          type="button"
                          onClick={() => onSeekToScene(fromFrame)}
                          className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/90 px-2.5 py-1 text-xs font-medium text-zinc-300 transition-all hover:border-indigo-500/60 hover:bg-indigo-950/40 hover:text-indigo-200 active:scale-95"
                          title={`Seek player to frame ${fromFrame}`}
                        >
                          <PlayCircle className="h-3.5 w-3.5 text-indigo-400 transition-transform group-hover:scale-110" />
                          <span>Seek</span>
                        </button>
                      )}

                      {/* Quick jump to Code tab */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCodeSceneId(scene.id);
                          setActiveTab("code");
                        }}
                        className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/90 px-2 py-1 text-xs font-medium text-zinc-400 hover:border-cyan-500/50 hover:bg-cyan-950/30 hover:text-cyan-300 transition-all active:scale-95"
                        title="View generated TSX code for this scene"
                      >
                        <Code2 className="h-3 w-3" />
                        <span className="hidden sm:inline">Code</span>
                      </button>

                      {/* Quick jump to Regenerate tab */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRegenSceneId(scene.id);
                          setActiveTab("regenerate");
                        }}
                        className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/90 px-2 py-1 text-xs font-medium text-zinc-400 hover:border-amber-500/50 hover:bg-amber-950/30 hover:text-amber-300 transition-all active:scale-95"
                        title="Regenerate this scene with custom directives"
                      >
                        <Wand2 className="h-3 w-3 text-amber-400" />
                        <span className="hidden sm:inline">Regen</span>
                      </button>
                    </div>
                  </div>

                  {/* Middle row: Icon, Headline & Subtext */}
                  <div className="flex items-start gap-3 pt-1">
                    {/* Scene Icon with Picker */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIconPickerSceneId(isPickingIcon ? null : scene.id)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-indigo-400 transition-all hover:border-indigo-400 hover:scale-105 shadow-sm"
                        title="Click to change Lucide icon"
                      >
                        <IconComponent className="h-5 w-5" />
                      </button>

                      {/* Icon Picker Popover */}
                      {isPickingIcon && (
                        <div className="absolute left-0 top-12 z-50 w-64 rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 shadow-2xl backdrop-blur-xl">
                          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
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
                                      : "text-zinc-300 hover:bg-zinc-800 hover:text-indigo-400"
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

                    {/* Headline and editable title */}
                    <div className="flex-1 min-w-0">
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
                            className="w-full rounded-lg border border-indigo-500 bg-zinc-950 px-3 py-1.5 text-sm font-semibold text-white focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setEditingSceneId(null)}
                            className="rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-xs text-zinc-300 hover:text-white"
                          >
                            Done
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => setEditingSceneId(scene.id)}
                          className="flex cursor-pointer items-center gap-2 group/edit"
                          title="Click to edit headline"
                        >
                          <h3 className="text-sm font-semibold text-zinc-100 group-hover/edit:text-indigo-300 transition-colors">
                            {scene.heading}
                          </h3>
                          <Edit3 className="h-3 w-3 text-zinc-500 opacity-0 transition-opacity group-hover/edit:opacity-100" />
                        </div>
                      )}

                      {scene.subtext && (
                        <p className="mt-0.5 text-xs text-zinc-400">
                          {scene.subtext}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Visual Brief */}
                  {scene.visualBrief && (
                    <div className="flex items-start gap-2 rounded-lg border border-zinc-800/80 bg-zinc-900/40 px-3 py-2 text-xs text-zinc-300">
                      <Eye className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400" />
                      <div>
                        <span className="font-semibold text-cyan-300">Visual Plan: </span>
                        <span className="italic text-zinc-300">{scene.visualBrief}</span>
                      </div>
                    </div>
                  )}

                  {/* Narration Summary Card */}
                  <div className="rounded-lg border border-zinc-800/70 bg-zinc-900/60 p-3">
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                        <Mic className="h-3 w-3 text-indigo-400" />
                        <span>Narration Voiceover</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-zinc-500">
                          {scene.narrationScript.trim().split(/\s+/).filter(Boolean).length} words
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyNarration(scene.id, scene.narrationScript)}
                          className="flex items-center gap-1 rounded p-1 text-zinc-400 hover:text-zinc-200 transition-colors"
                          title="Copy scene narration script"
                        >
                          {isNarrationCopied ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="font-sans text-xs leading-relaxed text-zinc-300">
                      {scene.narrationScript}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Tab 2: View Generated Code Tab */}
      {activeTab === "code" && (
        <div className="mt-4 flex flex-col gap-3">
          {/* Scene code selector dropdown/pills */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
              {project.scenes.map((s, idx) => {
                const isActive = activeCodeScene?.id === s.id;
                const sceneNum = String(idx + 1).padStart(2, "0");
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedCodeSceneId(s.id)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all shrink-0 ${
                      isActive
                        ? "border border-indigo-500 bg-indigo-600 text-white font-semibold shadow-sm"
                        : "border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                    }`}
                  >
                    <span className="font-mono text-[10px] opacity-80">{sceneNum}</span>
                    <span>Scene {idx + 1}</span>
                    {s.isCorrected && (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" title="Auto-corrected" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick action buttons */}
            {activeCodeScene && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRegenSceneId(activeCodeScene.id);
                    setActiveTab("regenerate");
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-300 hover:border-amber-500/60 hover:text-amber-300 transition-all active:scale-95"
                >
                  <RefreshCw className="h-3 w-3 text-amber-400" />
                  <span>Modify in Regen</span>
                </button>

                {activeCodeScene.code && (
                  <button
                    type="button"
                    onClick={() => handleCopyCode(activeCodeScene.code || "")}
                    className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/90 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:border-indigo-500 hover:bg-indigo-950/60 hover:text-white transition-all active:scale-95 shadow-sm"
                  >
                    {copiedCodeToast ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Copied TSX!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-zinc-400" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {activeCodeScene ? (
            <div className="flex flex-col gap-2">
              {/* Scene code metadata header */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <FileCode className="h-4 w-4 text-cyan-400" />
                  <span className="text-zinc-200 font-semibold">{activeCodeScene.heading}</span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-indigo-400" />
                    <span>{activeCodeScene.modelUsed || "Gemini Flash Code Mode"}</span>
                  </span>
                  <span>
                    {activeCodeScene.code ? `${activeCodeScene.code.length} chars · ${activeCodeLines.length} lines` : "0 lines"}
                  </span>
                </div>
              </div>

              {/* Pristine dark code editor/viewer box */}
              {activeCodeScene.code ? (
                <div className="overflow-hidden rounded-xl border border-zinc-800 bg-[#05070B] shadow-2xl">
                  {/* IDE header bar */}
                  <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950/80 px-4 py-2 text-xs text-zinc-400">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-rose-500/60" />
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
                      </div>
                      <span className="ml-2 font-mono text-zinc-400 text-[11px]">
                        SceneComponent_{activeCodeScene.id.slice(0, 8)}.tsx
                      </span>
                    </div>
                    <span className="rounded bg-zinc-900 border border-zinc-800 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
                      TypeScript (Remotion TSX)
                    </span>
                  </div>

                  {/* Code editor body with line numbers */}
                  <div className="flex max-h-[480px] overflow-auto font-mono text-xs text-zinc-300">
                    <div className="select-none border-r border-zinc-800/80 bg-zinc-950/50 py-3 pl-3 pr-2.5 text-right text-zinc-600">
                      {activeCodeLines.map((_, i) => (
                        <div key={i} className="leading-5">
                          {i + 1}
                        </div>
                      ))}
                    </div>
                    <div className="flex-1 overflow-x-auto py-3 px-4">
                      <pre className="m-0 leading-5">
                        <code>{activeCodeScene.code}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-zinc-800 bg-[#05070B] p-8 text-center text-xs text-zinc-400">
                  <Terminal className="h-8 w-8 text-zinc-600" />
                  <div>
                    <p className="font-semibold text-zinc-300">No Custom TSX Generated Yet</p>
                    <p className="mt-1 text-zinc-500 max-w-md">
                      This scene is currently rendering with standard responsive fallback templates. Use the Regenerate Scene tab to synthesize dynamic Remotion code for this scene.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRegenSceneId(activeCodeScene.id);
                      setActiveTab("regenerate");
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-indigo-500 transition-all active:scale-95"
                  >
                    <Wand2 className="h-3.5 w-3.5" />
                    <span>Synthesize Code in Regenerate Tab</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-zinc-500">No scenes available.</div>
          )}
        </div>
      )}

      {/* 4. Tab 3: Regenerate Scene Tab */}
      {activeTab === "regenerate" && (
        <div className="mt-4 flex flex-col gap-4">
          {/* Scene selector pills */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
              {project.scenes.map((s, idx) => {
                const isActive = activeRegenScene?.id === s.id;
                const sceneNum = String(idx + 1).padStart(2, "0");
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSelectedRegenSceneId(s.id);
                      setRegenSuccessSceneId(null);
                    }}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all shrink-0 ${
                      isActive
                        ? "border border-amber-500/80 bg-amber-600/90 text-white font-semibold shadow-sm"
                        : "border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                    }`}
                  >
                    <span className="font-mono text-[10px] opacity-80">{sceneNum}</span>
                    <span>Scene {idx + 1}</span>
                  </button>
                );
              })}
            </div>

            {/* Model attribution pill and status indicator */}
            {activeRegenScene && (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/40 px-3 py-1 text-xs font-medium text-indigo-300">
                  <Sparkles className="h-3 w-3 text-indigo-400" />
                  <span>Gemini 2.5 Flash Code Mode</span>
                </span>
              </div>
            )}
          </div>

          {activeRegenScene ? (
            <div className="flex flex-col gap-4">
              {/* Scene target spotlight card */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-800 font-mono text-xs font-bold text-zinc-300">
                      {String(activeRegenSceneIndex + 1).padStart(2, "0")}
                    </span>
                    <h4 className="text-sm font-semibold text-zinc-200">
                      {activeRegenScene.heading}
                    </h4>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center gap-2">
                    {regeneratingSceneId === activeRegenScene.id ? (
                      <span className="flex items-center gap-1.5 rounded-full border border-indigo-500/40 bg-indigo-950/60 px-2.5 py-0.5 text-xs text-indigo-300 font-medium">
                        <Loader2 className="h-3 w-3 animate-spin text-indigo-400" />
                        <span>Compiling Scene TSX...</span>
                      </span>
                    ) : activeRegenScene.isCorrected ? (
                      <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-950/50 px-2.5 py-0.5 text-xs text-emerald-300 font-medium">
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span>Code Verified</span>
                      </span>
                    ) : activeRegenScene.code ? (
                      <span className="flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/50 px-2.5 py-0.5 text-xs text-cyan-300 font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                        <span>Custom TSX Ready</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-0.5 text-xs text-zinc-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
                        <span>Fallback Template</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-2.5">
                    <span className="font-semibold text-cyan-300">Visual Plan: </span>
                    <span className="italic text-zinc-300">
                      {activeRegenScene.visualBrief || "No visual brief specified."}
                    </span>
                  </div>
                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-2.5">
                    <span className="font-semibold text-indigo-300">Narration Script: </span>
                    <span className="text-zinc-300 line-clamp-2">
                      {activeRegenScene.narrationScript}
                    </span>
                  </div>
                </div>
              </div>

              {/* Clean per-scene regeneration prompt input with custom instructions textarea */}
              <div className="flex flex-col gap-2 rounded-xl border border-zinc-800/90 bg-zinc-950/80 p-4">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor={`regen-input-${activeRegenScene.id}`}
                    className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300"
                  >
                    Custom Instructions for Scene {activeRegenSceneIndex + 1}
                  </label>
                  <span className="text-[11px] text-zinc-500">
                    Guide Gemini on animations, layout, diagram scale & styling
                  </span>
                </div>

                <textarea
                  id={`regen-input-${activeRegenScene.id}`}
                  rows={3}
                  value={customInstructions[activeRegenScene.id] || ""}
                  onChange={(e) =>
                    setCustomInstructions({
                      ...customInstructions,
                      [activeRegenScene.id]: e.target.value,
                    })
                  }
                  placeholder='e.g., "make the diagram bigger and centered", "explain with a 3-step flowchart with arrows", "highlight the metric counter with glowing neon cyan"...'
                  className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-xs text-zinc-200 placeholder-zinc-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 focus:outline-none transition-all"
                />

                {/* Quick Suggestion Pills */}
                <div className="mt-1 flex flex-col gap-1.5">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                    Quick Directives:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {PROMPT_SUGGESTIONS.map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplySuggestion(activeRegenScene.id, suggestion)}
                        className="rounded-lg border border-zinc-800 bg-zinc-900/90 px-2.5 py-1 text-[11px] text-zinc-400 hover:border-indigo-500/50 hover:bg-indigo-950/40 hover:text-indigo-300 transition-all text-left"
                      >
                        + {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800/80 pt-3">
                  <div className="text-xs text-zinc-500">
                    {regenSuccessSceneId === activeRegenScene.id ? (
                      <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                        <Check className="h-4 w-4" />
                        <span>Scene {activeRegenSceneIndex + 1} TSX code regenerated successfully!</span>
                      </span>
                    ) : (
                      <span>Synthesizes Remotion TSX using Gemini Flash Code Mode</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {activeRegenScene.code && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCodeSceneId(activeRegenScene.id);
                          setActiveTab("code");
                        }}
                        className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white transition-all"
                      >
                        <span>View Code</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRegenerate(activeRegenScene.id)}
                      disabled={regeneratingSceneId === activeRegenScene.id || !onRegenerateScene}
                      className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-950/50 hover:bg-indigo-500 disabled:opacity-50 transition-all active:scale-95"
                    >
                      {regeneratingSceneId === activeRegenScene.id ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                          <span>Generating Code...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 text-white" />
                          <span>Regenerate Scene {activeRegenSceneIndex + 1}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-zinc-500">No scenes available.</div>
          )}
        </div>
      )}
    </div>
  );
};
