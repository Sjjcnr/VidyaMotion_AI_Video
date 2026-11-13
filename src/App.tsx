import type { PlayerRef } from "@remotion/player";
import { Code2, Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";
import { Header } from "./components/Header";
import { PromptPanel } from "./components/PromptPanel";
import { SceneBreakdownTabs } from "./components/SceneBreakdownTabs";
import { VideoPreviewPanel } from "./components/VideoPreviewPanel";
import { useVideoExport } from "./hooks/useVideoExport";
import { useVideoProject } from "./hooks/useVideoProject";
import type { AspectRatio, LanguageCode, ThemeId } from "./remotion/types";

export function App() {
  const {
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
    regenerateScene,
    generateVideo,
    cancelGeneration,
    deleteSavedProject,
    loadSavedProject,
  } = useVideoProject();

  const {
    exportVideo,
    cancelExport,
    isExporting,
    exportProgress,
    canExport,
    exportError,
  } = useVideoExport();

  const playerRef = useRef<PlayerRef | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as unknown as { __vidyamotion?: unknown }).__vidyamotion = {
        currentProject,
        setCurrentProject,
        exportVideo,
        loadPreset,
      };
    }
  }, [currentProject, setCurrentProject, exportVideo, loadPreset]);

  const handleAspectRatioChange = (aspectRatio: AspectRatio) => {
    setCurrentProject((prev) => ({ ...prev, aspectRatio }));
  };

  const handleThemeChange = (theme: ThemeId) => {
    setCurrentProject((prev) => ({ ...prev, theme }));
  };

  const handleLanguageChange = (language: LanguageCode) => {
    setCurrentProject((prev) => ({ ...prev, language }));
  };

  const handleTopicChange = (topic: string) => {
    setCurrentProject((prev) => ({ ...prev, topic }));
  };

  const handleGenerate = (topic: string, customInstruction?: string) => {
    void generateVideo({
      topic,
      customInstruction,
      language: currentProject.language,
      theme: currentProject.theme,
      aspectRatio: currentProject.aspectRatio,
    });
  };

  const handleSeekToScene = (startFrame: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(startFrame);
      playerRef.current.play();
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-[#0A0D14] text-zinc-100 antialiased selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* Ambient background glow (Linear/Vercel style) */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 flex justify-center overflow-hidden"
        aria-hidden="true"
      >
        <div className="h-[360px] w-[860px] -translate-y-1/2 bg-gradient-to-b from-indigo-500/15 via-purple-500/5 to-transparent blur-[120px] opacity-70" />
        <div className="absolute top-0 h-px w-3/4 max-w-5xl bg-gradient-to-r from-transparent via-indigo-500/25 to-transparent" />
      </div>

      {/* Studio Header */}
      <Header
        currentLanguage={currentProject.language}
        onLanguageChange={handleLanguageChange}
        onLoadPreset={loadPreset}
        savedProjects={savedProjects}
        onLoadSavedProject={loadSavedProject}
        onDeleteSavedProject={deleteSavedProject}
        currentProjectId={currentProject.id}
      />

      {/* Main Studio Viewport */}
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 sm:p-6 lg:gap-8">
        {/* Banner notification / Subtitle info */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3.5 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-semibold text-zinc-200">
                Autonomous AI Video Generation Studio
              </p>
              <p className="text-[11px] text-zinc-400">
                Topic prompt → Gemini Scene Director → Edge-TTS Neural Voice → Remotion Kinetic Video
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-950/60 px-2.5 py-1 text-[11px] font-medium text-zinc-300">
            <Code2 className="h-3.5 w-3.5 text-indigo-400" />
            <span>Autonomous Remotion Code Engine</span>
          </div>
        </div>

        {/* Studio Grid: Left Controls (5 cols), Right Preview + Breakdown (7 cols) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start lg:gap-8">
          {/* Left Column: Topic Prompt & Video Controls */}
          <section className="lg:col-span-5 flex flex-col gap-6">
            <PromptPanel
              currentTopic={currentProject.topic}
              onTopicChange={handleTopicChange}
              aspectRatio={currentProject.aspectRatio}
              onAspectRatioChange={handleAspectRatioChange}
              theme={currentProject.theme}
              onThemeChange={handleThemeChange}
              language={currentProject.language}
              onGenerate={handleGenerate}
              onCancelGeneration={cancelGeneration}
              generationStatus={generationStatus}
              generationProgress={generationProgress}
              statusMessage={statusMessage}
              error={error}
              modelUsed={modelUsed}
              fallbackUsed={fallbackUsed}
              onLoadPreset={loadPreset}
            />
          </section>

          {/* Right Column: Remotion Live Preview Canvas & Scene Breakdown Tabs */}
          <section className="lg:col-span-7 flex flex-col gap-6">
            <VideoPreviewPanel
              project={currentProject}
              playerRef={playerRef}
              onExport={(resolution) => exportVideo(currentProject, resolution)}
              onCancelExport={cancelExport}
              isExporting={isExporting}
              exportProgress={exportProgress}
              canExport={canExport}
              exportError={exportError}
            />

            <SceneBreakdownTabs
              project={currentProject}
              onUpdateHeading={updateSceneHeading}
              onUpdateIcon={updateSceneIcon}
              onSeekToScene={handleSeekToScene}
              onRegenerateScene={regenerateScene}
            />
          </section>
        </div>
      </main>

      {/* Studio Footer */}
      <footer className="mt-auto border-t border-zinc-800/80 bg-zinc-950/80 py-4 text-center text-xs text-zinc-500 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 sm:px-6">
          <span className="text-zinc-400 font-medium">
            VidyaMotion AI · Dynamic Code-Mode Video Studio
          </span>
          <span className="font-mono text-[11px] text-zinc-500">
            React 19 · Remotion 4 · Vite 8 · Gemini Flash · Edge-TTS
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
