import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Code2,
  Cpu,
  Layers,
  Loader2,
  Monitor,
  ShieldAlert,
  Smartphone,
  Sparkles,
  Volume2,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import type { AspectRatio, LanguageCode, ThemeId } from "../remotion/types";
import type { GenerationPhase } from "../services/apiClient";

export interface PromptPanelProps {
  currentTopic: string;
  onTopicChange: (topic: string) => void;
  aspectRatio: AspectRatio;
  onAspectRatioChange: (aspectRatio: AspectRatio) => void;
  theme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
  language: LanguageCode;
  onGenerate: (topic: string, customInstruction?: string) => void;
  onCancelGeneration: () => void;
  generationStatus: GenerationPhase;
  generationProgress: number;
  statusMessage: string;
  error: string | null;
  modelUsed: string | null;
  fallbackUsed: boolean;
  onLoadPreset: (presetId: string) => void;
}

const SUGGESTIONS = [
  "Explain QuickSort Algorithm",
  "How Solar Panels Generate Electricity",
  "DNA Double Helix Structure",
  "Ohm's Law & Circuit Analysis",
];

const THEMES: {
  id: ThemeId;
  name: string;
  desc: string;
  accent: string;
  bg: string;
}[] = [
  {
    id: "clean_modern",
    name: "Clean Modern",
    desc: "Slate & Indigo",
    accent: "#6366F1",
    bg: "#0B0F19",
  },
  {
    id: "cyber_dark",
    name: "Cyber Dark",
    desc: "Cyan & Charcoal",
    accent: "#06B6D4",
    bg: "#020617",
  },
  {
    id: "sunset_amber",
    name: "Sunset Amber",
    desc: "Warm Amber & Coral",
    accent: "#F59E0B",
    bg: "#140B07",
  },
  {
    id: "emerald_nature",
    name: "Emerald Nature",
    desc: "Lush Emerald & Mint",
    accent: "#10B981",
    bg: "#04150E",
  },
];

const DEFAULT_INSTRUCTION =
  "Generate extensive, high-density Remotion TSX code (200-450+ lines). Strictly no PowerPoint-style bullet points or summary cards. Create rich animated SVG diagrams, physics/process simulations, mathematical curves, or detailed schematics timed to voiceover.";

export const PromptPanel: React.FC<PromptPanelProps> = ({
  currentTopic,
  onTopicChange,
  aspectRatio,
  onAspectRatioChange,
  theme,
  onThemeChange,
  onGenerate,
  onCancelGeneration,
  generationStatus,
  generationProgress,
  statusMessage,
  error,
  modelUsed,
  fallbackUsed,
  onLoadPreset,
}) => {
  const [inputVal, setInputVal] = useState(currentTopic);
  const [customInstruction, setCustomInstruction] = useState(DEFAULT_INSTRUCTION);
  const [showAdvancedPrompt, setShowAdvancedPrompt] = useState(false);

  // Synchronize internal input value with currentTopic prop changes (e.g. presets)
  useEffect(() => {
    setInputVal(currentTopic);
  }, [currentTopic]);

  const isGenerating =
    generationStatus === "generating-script" ||
    generationStatus === "synthesizing-audio" ||
    generationStatus === "building-timeline";

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputVal(e.target.value);
    onTopicChange(e.target.value);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputVal(suggestion);
    onTopicChange(suggestion);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim() && !isGenerating) {
      onGenerate(inputVal.trim(), customInstruction.trim());
    }
  };

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-5 shadow-xl backdrop-blur-md">
      {/* Header title */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xs font-semibold tracking-wider text-zinc-200 uppercase">
              Topic Prompt & Controls
            </h2>
            <p className="text-[10px] font-medium text-zinc-500">
              Generate autonomous Remotion animation from any concept
            </p>
          </div>
        </div>
        {modelUsed && (
          <div className="flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-950/80 px-2.5 py-1 text-[10px] font-medium text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{fallbackUsed ? "Fallback: " : "Engine: "}</span>
            <span className="font-mono text-indigo-400">{modelUsed}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Topic Input Textarea */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="topic-input"
              className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider"
            >
              Prompt Topic
            </label>
            <span className="font-mono text-[10px] text-zinc-500">
              {inputVal.length} chars
            </span>
          </div>
          <textarea
            id="topic-input"
            rows={3}
            value={inputVal}
            onChange={handleInputChange}
            disabled={isGenerating}
            placeholder="e.g. How Solar Panels Generate Electricity, QuickSort Algorithm, Ohm's Law..."
            className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-sm text-slate-100 placeholder-zinc-500 transition-all duration-150 focus:border-indigo-500/80 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {/* Suggestion Chips */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Suggested Topics
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                disabled={isGenerating}
                onClick={() => handleSuggestionClick(suggestion)}
                className="rounded-lg border border-zinc-800/80 bg-zinc-950/60 px-2.5 py-1 text-[11px] font-medium text-zinc-400 transition-all hover:border-zinc-700 hover:bg-zinc-800/60 hover:text-zinc-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Aspect Ratio Selector */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Aspect Ratio & Format
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isGenerating}
              onClick={() => onAspectRatioChange("16:9")}
              className={`group flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-medium transition-all active:scale-[0.98] ${
                aspectRatio === "16:9"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-1 ring-indigo-400/30"
                  : "border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
              }`}
            >
              <Monitor
                className={`h-4 w-4 ${
                  aspectRatio === "16:9"
                    ? "text-white"
                    : "text-zinc-400 group-hover:text-zinc-300"
                }`}
              />
              <span className="font-semibold">16:9 Landscape</span>
              <span
                className={`text-[10px] ${
                  aspectRatio === "16:9" ? "text-indigo-200" : "text-zinc-500"
                }`}
              >
                (1080p)
              </span>
            </button>

            <button
              type="button"
              disabled={isGenerating}
              onClick={() => onAspectRatioChange("9:16")}
              className={`group flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-medium transition-all active:scale-[0.98] ${
                aspectRatio === "9:16"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-1 ring-indigo-400/30"
                  : "border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
              }`}
            >
              <Smartphone
                className={`h-4 w-4 ${
                  aspectRatio === "9:16"
                    ? "text-white"
                    : "text-zinc-400 group-hover:text-zinc-300"
                }`}
              />
              <span className="font-semibold">9:16 Portrait</span>
              <span
                className={`text-[10px] ${
                  aspectRatio === "9:16" ? "text-indigo-200" : "text-zinc-500"
                }`}
              >
                (Shorts)
              </span>
            </button>
          </div>
        </div>

        {/* Visual Color Theme Selector */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Color Palette Theme
          </span>
          <div className="grid grid-cols-2 gap-2">
            {THEMES.map((t) => {
              const isSelected = theme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  disabled={isGenerating}
                  onClick={() => onThemeChange(t.id)}
                  className={`flex flex-col gap-1 rounded-xl p-2.5 text-left transition-all active:scale-[0.98] ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-1 ring-indigo-400/30"
                      : "border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold ${
                        isSelected ? "text-white" : "text-zinc-200"
                      }`}
                    >
                      {t.name}
                    </span>
                    <span
                      className="h-2.5 w-2.5 rounded-full ring-2 ring-zinc-900 shadow-sm"
                      style={{ backgroundColor: t.accent }}
                    />
                  </div>
                  <span
                    className={`text-[10px] truncate ${
                      isSelected ? "text-indigo-100" : "text-zinc-500"
                    }`}
                  >
                    {t.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Expandable Custom Instructions & Directive Panel */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowAdvancedPrompt((prev) => !prev)}
              className="group flex items-center gap-2 text-left focus:outline-none"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-zinc-800/80 text-zinc-400 transition-colors group-hover:text-zinc-200">
                <Code2 className="h-3 w-3" />
              </div>
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider transition-colors group-hover:text-zinc-300">
                Code Generation Directives
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-zinc-500 transition-transform duration-200 group-hover:text-zinc-300 ${
                  showAdvancedPrompt ? "rotate-180" : ""
                }`}
              />
            </button>
            <button
              type="button"
              onClick={() => setShowAdvancedPrompt((prev) => !prev)}
              className="text-[11px] font-medium text-indigo-400 transition-colors hover:text-indigo-300"
            >
              {showAdvancedPrompt ? "Collapse" : "Customize"}
            </button>
          </div>

          <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/80 p-3 text-xs transition-all">
            <div className="mb-2 flex items-center justify-between gap-2 border-b border-zinc-800/60 pb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Active Directive
                </span>
              </div>
              <span className="rounded border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 font-mono text-[10px] font-medium text-indigo-400">
                Anti-PPT Mode (200-450+ TSX lines)
              </span>
            </div>

            {showAdvancedPrompt ? (
              <div className="flex flex-col gap-2">
                <textarea
                  rows={3}
                  value={customInstruction}
                  onChange={(e) => setCustomInstruction(e.target.value)}
                  disabled={isGenerating}
                  placeholder="Custom directive appended to Remotion code generation request..."
                  className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-900/90 p-2.5 font-mono text-xs text-zinc-200 placeholder-zinc-500 transition-colors focus:border-indigo-500/80 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 disabled:opacity-50"
                />
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-zinc-500">
                    Enforces programmatic SVG & math animations
                  </span>
                  {customInstruction !== DEFAULT_INSTRUCTION && (
                    <button
                      type="button"
                      onClick={() => setCustomInstruction(DEFAULT_INSTRUCTION)}
                      className="text-indigo-400 transition-colors hover:text-indigo-300"
                    >
                      Reset to Default
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <p className="line-clamp-2 font-mono text-[11px] leading-relaxed text-zinc-400 italic">
                "{customInstruction}"
              </p>
            )}
          </div>
        </div>

        {/* Primary Action Button ('Generate Video') & Status */}
        <div className="mt-1 flex flex-col gap-3">
          {isGenerating ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600/90 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 cursor-wait"
              >
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>Generating Video... {generationProgress}%</span>
              </button>
              <button
                type="button"
                onClick={onCancelGeneration}
                className="flex items-center justify-center rounded-xl border border-rose-500/30 bg-rose-950/40 px-3.5 py-3 text-xs font-semibold text-rose-300 transition-colors hover:bg-rose-900/60 hover:text-rose-200 active:scale-[0.98]"
                title="Cancel Generation"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all duration-150 hover:bg-indigo-500 hover:shadow-indigo-500/35 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
            >
              <Sparkles className="h-4 w-4 text-indigo-200 transition-transform duration-200 group-hover:scale-110" />
              <span>Generate Video</span>
            </button>
          )}

          {/* Progress Feedback: Sleek two-tone progress bar with percentage & animated pulse */}
          {isGenerating && (
            <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-950/90 p-4 shadow-inner">
              {/* Status Header with Animated Pulse */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
                  </span>
                  <span className="font-medium text-zinc-200">
                    {statusMessage}
                  </span>
                </div>
                <span className="font-mono text-xs font-semibold text-indigo-400 tabular-nums">
                  {generationProgress}%
                </span>
              </div>

              {/* Sleek Two-Tone Progress Bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800/80">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400 transition-all duration-300 ease-out shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                  style={{ width: `${Math.max(generationProgress, 2)}%` }}
                />
              </div>

              {/* 4 sequential milestone badges */}
              <div className="grid grid-cols-4 gap-1.5 pt-1 text-[10px]">
                <div
                  className={`flex flex-col items-center gap-1 rounded-lg p-1.5 text-center transition-colors ${
                    generationStatus === "generating-script"
                      ? "border border-indigo-500/40 bg-indigo-500/10 font-bold text-indigo-400"
                      : generationProgress > 25
                      ? "font-medium text-zinc-400"
                      : "text-zinc-600"
                  }`}
                >
                  <Cpu className="h-3.5 w-3.5" />
                  <span>1. Script</span>
                </div>
                <div
                  className={`flex flex-col items-center gap-1 rounded-lg p-1.5 text-center transition-colors ${
                    generationStatus === "synthesizing-audio"
                      ? "border border-indigo-500/40 bg-indigo-500/10 font-bold text-indigo-400"
                      : generationProgress > 85
                      ? "font-medium text-zinc-400"
                      : "text-zinc-600"
                  }`}
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>2. Voice & Code</span>
                </div>
                <div
                  className={`flex flex-col items-center gap-1 rounded-lg p-1.5 text-center transition-colors ${
                    generationStatus === "building-timeline"
                      ? "border border-indigo-500/40 bg-indigo-500/10 font-bold text-indigo-400"
                      : generationProgress >= 95
                      ? "font-medium text-zinc-400"
                      : "text-zinc-600"
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>3. Time-Lock</span>
                </div>
                <div
                  className={`flex flex-col items-center gap-1 rounded-lg p-1.5 text-center transition-colors ${
                    generationProgress >= 100
                      ? "border border-emerald-500/40 bg-emerald-500/10 font-bold text-emerald-400"
                      : "text-zinc-600"
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>4. Ready</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Banner with Offline Showcase Rescue Action */}
          {error && (
            <div className="flex flex-col gap-2 rounded-xl border border-rose-500/30 bg-rose-950/30 p-3.5 text-xs text-rose-200 backdrop-blur-sm">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-rose-300">Generation Notice</p>
                  <p className="mt-0.5 text-rose-200/90 leading-relaxed">{error}</p>
                </div>
              </div>
              <div className="mt-1 flex items-center justify-between border-t border-rose-900/50 pt-2.5">
                <span className="text-[11px] text-rose-300/80">
                  Featured Offline Demos are ready:
                </span>
                <button
                  type="button"
                  onClick={() => onLoadPreset("binary-search-trees")}
                  className="rounded-lg border border-indigo-500/30 bg-indigo-500/20 px-2.5 py-1 text-[11px] font-semibold text-indigo-300 transition-colors hover:bg-indigo-500/30 active:scale-95"
                >
                  Load BST Demo
                </button>
              </div>
            </div>
          )}
        </div>
      </form>

      {/* Privacy Notice */}
      <div className="mt-1 flex items-start gap-2.5 rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3 text-[11px] text-zinc-400">
        <ShieldAlert className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-semibold text-zinc-300">
            Privacy Notice:
          </strong>{" "}
          Powered by Gemini Free Tier — do not enter private, confidential, or
          personal information.
        </p>
      </div>
    </div>
  );
};
