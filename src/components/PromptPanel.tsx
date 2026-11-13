import {
  AlertCircle,
  CheckCircle2,
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
import React, { useState } from "react";
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
  onGenerate: (topic: string) => void;
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
];

const THEMES: {
  id: ThemeId;
  name: string;
  desc: string;
  accent: string;
  bg: string;
}[] = [
  {
    id: "cyber_dark",
    name: "Cyber Dark",
    desc: "Neon Cyan & Deep Slate",
    accent: "#06B6D4",
    bg: "#020617",
  },
  {
    id: "clean_modern",
    name: "Clean Modern",
    desc: "Pure Indigo & Slate Blue",
    accent: "#6366F1",
    bg: "#0B0F19",
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
      onGenerate(inputVal.trim());
    }
  };

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-md">
      {/* Header title */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-cyan-400" />
          <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
            Topic Prompt & Controls
          </h2>
        </div>
        {modelUsed && (
          <span className="rounded-full bg-slate-800/90 px-2.5 py-0.5 text-[10px] font-medium text-slate-300">
            {fallbackUsed ? "Fallback: " : "Engine: "}
            <span className="text-cyan-400">{modelUsed}</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Topic Input Textarea */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="topic-input"
            className="text-xs font-medium text-slate-300"
          >
            What educational topic should VidyaMotion explain?
          </label>
          <textarea
            id="topic-input"
            rows={3}
            value={inputVal}
            onChange={handleInputChange}
            disabled={isGenerating}
            placeholder="e.g. How Solar Panels Generate Electricity, or QuickSort Algorithm..."
            className="w-full resize-none rounded-xl border border-slate-700/80 bg-slate-950/90 p-3 text-sm text-slate-100 placeholder-slate-500 transition-colors focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
          />
        </div>

        {/* Suggestion Chips */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium text-slate-400">
            Prompt suggestions:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                disabled={isGenerating}
                onClick={() => handleSuggestionClick(suggestion)}
                className="rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-1 text-[11px] text-slate-300 transition-all hover:border-cyan-500/50 hover:bg-cyan-950/30 hover:text-cyan-300 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Aspect Ratio Toggle (16:9 vs 9:16) */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-slate-300">
            Aspect Ratio & Format:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isGenerating}
              onClick={() => onAspectRatioChange("16:9")}
              className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-medium transition-all ${
                aspectRatio === "16:9"
                  ? "border-cyan-500 bg-cyan-950/40 text-cyan-200 shadow-sm shadow-cyan-500/10"
                  : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              <Monitor className="h-4 w-4" />
              <span>16:9 Landscape</span>
              <span className="text-[10px] text-slate-500">(1080p)</span>
            </button>

            <button
              type="button"
              disabled={isGenerating}
              onClick={() => onAspectRatioChange("9:16")}
              className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-medium transition-all ${
                aspectRatio === "9:16"
                  ? "border-cyan-500 bg-cyan-950/40 text-cyan-200 shadow-sm shadow-cyan-500/10"
                  : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              <Smartphone className="h-4 w-4" />
              <span>9:16 Portrait</span>
              <span className="text-[10px] text-slate-500">(Shorts)</span>
            </button>
          </div>
        </div>

        {/* Visual Theme Selector */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-slate-300">
            Visual Color Theme:
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
                  className={`flex flex-col gap-1 rounded-xl border p-2 text-left transition-all ${
                    isSelected
                      ? "border-cyan-400 bg-slate-950 text-white shadow-sm shadow-cyan-500/10 ring-1 ring-cyan-500/40"
                      : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-200">
                      {t.name}
                    </span>
                    <span
                      className="h-3 w-3 rounded-full border border-slate-700"
                      style={{ backgroundColor: t.accent }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 truncate">
                    {t.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Generation Action Button & Progress */}
        <div className="mt-1 flex flex-col gap-3">
          {isGenerating ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-600/20"
              >
                <Loader2 className="h-4 w-4 animate-spin text-cyan-200" />
                <span>Generating Video... {generationProgress}%</span>
              </button>
              <button
                type="button"
                onClick={onCancelGeneration}
                className="flex items-center justify-center rounded-xl border border-rose-500/40 bg-rose-950/40 px-3 py-3 text-xs font-medium text-rose-300 hover:bg-rose-900/60"
                title="Cancel Generation"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:from-cyan-400 hover:to-blue-500 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
            >
              <Sparkles className="h-4 w-4" />
              <span>Generate Autonomous Video</span>
            </button>
          )}

          {/* Animated Multi-Step Progress Tracker */}
          {isGenerating && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-3.5">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-medium text-cyan-300">
                  {statusMessage}
                </span>
                <span className="font-mono text-cyan-400">
                  {generationProgress}%
                </span>
              </div>

              {/* Progress bar line */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-teal-400 transition-all duration-300 ease-out"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>

              {/* 4 sequential milestone badges */}
              <div className="mt-3 grid grid-cols-4 gap-1 text-[10px]">
                <div
                  className={`flex flex-col items-center gap-1 text-center ${
                    generationStatus === "generating-script"
                      ? "text-cyan-400 font-bold"
                      : generationProgress > 25
                      ? "text-slate-400 font-normal"
                      : "text-slate-600"
                  }`}
                >
                  <Cpu className="h-3.5 w-3.5" />
                  <span>1. Script</span>
                </div>
                <div
                  className={`flex flex-col items-center gap-1 text-center ${
                    generationStatus === "synthesizing-audio"
                      ? "text-cyan-400 font-bold"
                      : generationProgress > 85
                      ? "text-slate-400 font-normal"
                      : "text-slate-600"
                  }`}
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>2. Voiceover</span>
                </div>
                <div
                  className={`flex flex-col items-center gap-1 text-center ${
                    generationStatus === "building-timeline"
                      ? "text-cyan-400 font-bold"
                      : generationProgress >= 95
                      ? "text-slate-400 font-normal"
                      : "text-slate-600"
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>3. Time-Lock</span>
                </div>
                <div
                  className={`flex flex-col items-center gap-1 text-center ${
                    generationProgress >= 100
                      ? "text-emerald-400 font-bold"
                      : "text-slate-600"
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
            <div className="flex flex-col gap-2 rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-rose-300">Generation Notice</p>
                  <p className="mt-0.5 text-rose-200/90 leading-relaxed">{error}</p>
                </div>
              </div>
              <div className="mt-1 flex items-center justify-between border-t border-rose-900/50 pt-2">
                <span className="text-[11px] text-rose-300/80">
                  Tech Expo Offline Showcase is ready:
                </span>
                <button
                  type="button"
                  onClick={() => onLoadPreset("binary-search-trees")}
                  className="rounded-lg bg-amber-500/20 px-2.5 py-1 text-[11px] font-semibold text-amber-300 hover:bg-amber-500/30"
                >
                  Load BST Demo
                </button>
              </div>
            </div>
          )}
        </div>
      </form>

      {/* Mandatory Section 5 Privacy Notice */}
      <div className="mt-1 flex items-start gap-2 rounded-xl border border-slate-800/80 bg-slate-950/70 p-3 text-[11px] text-slate-400">
        <ShieldAlert className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-semibold text-slate-300">
            Privacy Notice:
          </strong>{" "}
          Powered by Gemini Free Tier — do not enter private, confidential, or
          personal information.
        </p>
      </div>
    </div>
  );
};
