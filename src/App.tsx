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
    <div className="flex min-h-screen flex-col bg-[#090D16] text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
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
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-3.5 backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-200">
                Autonomous AI Video Generation Studio
              </p>
              <p className="text-[11px] text-slate-400">
                Topic prompt → Gemini Scene Director → Edge-TTS Neural Voice → Remotion Kinetic Video
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-[11px] text-slate-300">
            <Code2 className="h-3.5 w-3.5 text-indigo-400" />
            <span>Autonomous Remotion Code Engine</span>
          </div>
        </div>

        {/* Studio Grid: Left Controls (4 cols), Right Preview + Breakdown (8 cols) */}
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
              onExport={() => exportVideo(currentProject)}
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
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 sm:px-6">
          <span>
            VidyaMotion AI · Dynamic Code-Mode Video Studio
          </span>
          <span className="font-mono text-[11px] text-slate-600">
            React 19 · Remotion 4 · Vite 8 · Gemini Flash · Edge-TTS
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
