import {
  Bookmark,
  ChevronDown,
  Globe,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { SHOWCASE_PRESETS } from "../data/showcasePresets";
import type { LanguageCode, VideoProject } from "../remotion/types";

export interface HeaderProps {
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onLoadPreset: (presetId: string) => void;
  savedProjects?: VideoProject[];
  onLoadSavedProject?: (projectId: string) => void;
  onDeleteSavedProject?: (projectId: string) => void;
  currentProjectId?: string;
}

const LANGUAGES: {
  code: LanguageCode;
  name: string;
  native: string;
  voice: string;
}[] = [
  {
    code: "en-IN",
    name: "English (India)",
    native: "English",
    voice: "Neerja Neural",
  },
  {
    code: "hi-IN",
    name: "Hindi (India)",
    native: "हिन्दी",
    voice: "Swara Neural",
  },
  {
    code: "gu-IN",
    name: "Gujarati (India)",
    native: "ગુજરાતી",
    voice: "Dhwani Neural",
  },
  {
    code: "en-US",
    name: "English (US)",
    native: "English",
    voice: "Jenny Neural",
  },
];

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onLanguageChange,
  onLoadPreset,
  savedProjects = [],
  onLoadSavedProject,
  onDeleteSavedProject,
  currentProjectId,
}) => {
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showSavedMenu, setShowSavedMenu] = useState(false);

  const presetsMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const savedMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        presetsMenuRef.current &&
        !presetsMenuRef.current.contains(event.target as Node)
      ) {
        setShowPresetsMenu(false);
      }
      if (
        langMenuRef.current &&
        !langMenuRef.current.contains(event.target as Node)
      ) {
        setShowLangMenu(false);
      }
      if (
        savedMenuRef.current &&
        !savedMenuRef.current.contains(event.target as Node)
      ) {
        setShowSavedMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeLang =
    LANGUAGES.find((l) => l.code === currentLanguage) || LANGUAGES[0];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/30">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white">
                VidyaMotion <span className="text-cyan-400">AI</span>
              </span>
              <span className="rounded-full border border-cyan-500/30 bg-cyan-950/60 px-2 py-0.5 text-[10px] font-medium tracking-wide text-cyan-300">
                ⚡ Tech Expo 2027
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Autonomous Topic-to-Animated-Video Studio · Bharat @ 2047
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Expo Showcase Quick-Load Dropdown */}
          <div className="relative" ref={presetsMenuRef}>
            <button
              type="button"
              onClick={() => setShowPresetsMenu((prev) => !prev)}
              className="flex items-center gap-2 rounded-lg border border-amber-500/40 bg-gradient-to-r from-amber-500/15 to-orange-500/10 px-3 py-1.5 text-xs font-semibold text-amber-200 transition-all hover:border-amber-400 hover:bg-amber-500/25 active:scale-95 shadow-sm shadow-amber-500/10"
              title="Pre-warmed offline showcase demos that work without internet or quota"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
              <span className="hidden sm:inline">Expo Showcase</span>
              <span className="rounded bg-amber-400/20 px-1 py-0.2 text-[10px] font-bold text-amber-300">
                4 Demos
              </span>
              <ChevronDown className="h-3.5 w-3.5 opacity-70" />
            </button>

            {showPresetsMenu && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-800 bg-slate-900/95 p-1.5 shadow-2xl backdrop-blur-lg">
                <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-amber-400/90 border-b border-slate-800/80">
                  Offline Showcase Presets
                </div>
                <div className="mt-1 space-y-1">
                  {SHOWCASE_PRESETS.map((preset) => {
                    const isSelected =
                      currentProjectId === preset.project.id ||
                      currentProjectId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          onLoadPreset(preset.id);
                          setShowPresetsMenu(false);
                        }}
                        className={`flex w-full flex-col rounded-lg px-3 py-2 text-left transition-colors ${
                          isSelected
                            ? "border border-amber-500/40 bg-amber-950/40 text-amber-200"
                            : "text-slate-200 hover:bg-slate-800/70"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium truncate">
                            {preset.label}
                          </span>
                          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
                            {preset.languageLabel}
                          </span>
                        </div>
                        <span className="mt-0.5 text-[10px] text-slate-400">
                          {preset.badge} · {preset.project.scenes.length} Scenes
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Saved Projects Dropdown (if any) */}
          {savedProjects.length > 0 && (
            <div className="relative" ref={savedMenuRef}>
              <button
                type="button"
                onClick={() => setShowSavedMenu((prev) => !prev)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:bg-slate-800"
                title="Locally stored videos"
              >
                <Bookmark className="h-3.5 w-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Saved</span>
                <span className="rounded-full bg-slate-800 px-1.5 text-[10px] text-cyan-300">
                  {savedProjects.length}
                </span>
              </button>

              {showSavedMenu && (
                <div className="absolute right-0 mt-2 w-80 max-h-80 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900/95 p-1.5 shadow-2xl backdrop-blur-lg">
                  <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
                    Saved Studio Projects ({savedProjects.length})
                  </div>
                  <div className="mt-1 space-y-1">
                    {savedProjects.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between rounded-lg px-2.5 py-1.5 hover:bg-slate-800/70"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            onLoadSavedProject?.(p.id);
                            setShowSavedMenu(false);
                          }}
                          className="flex flex-1 flex-col text-left truncate mr-2"
                        >
                          <span className="text-xs font-medium text-slate-200 truncate">
                            {p.topic}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {p.language} · {p.scenes.length} scenes ·{" "}
                            {Math.round(p.totalDurationInFrames / 30)}s
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSavedProject?.(p.id);
                          }}
                          className="p-1 text-slate-500 hover:text-rose-400"
                          title="Delete saved project"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Regional Voice & Language Selector */}
          <div className="relative" ref={langMenuRef}>
            <button
              type="button"
              onClick={() => setShowLangMenu((prev) => !prev)}
              className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-slate-700 hover:bg-slate-800 active:scale-95 transition-all"
            >
              <Globe className="h-3.5 w-3.5 text-cyan-400" />
              <span>{activeLang.native}</span>
              <span className="hidden sm:inline text-slate-400 text-[10px]">
                ({activeLang.code})
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-800 bg-slate-900/95 p-1.5 shadow-2xl backdrop-blur-lg">
                <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-cyan-400/90 border-b border-slate-800/80">
                  Narration Language & Voice
                </div>
                <div className="mt-1 space-y-1">
                  {LANGUAGES.map((lang) => {
                    const isSelected = currentLanguage === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          onLanguageChange(lang.code);
                          setShowLangMenu(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors ${
                          isSelected
                            ? "bg-cyan-950/60 text-cyan-300 font-semibold border border-cyan-500/30"
                            : "text-slate-300 hover:bg-slate-800/70"
                        }`}
                      >
                        <div>
                          <div className="text-xs font-medium">
                            {lang.native} ({lang.name})
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Neural Voice: {lang.voice}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono uppercase text-slate-400">
                          {lang.code}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
