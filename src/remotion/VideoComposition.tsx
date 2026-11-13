import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { KaraokeCaptionsOverlay } from "./components/KaraokeCaptionsOverlay";
import { SceneBackground } from "./components/SceneBackground";
import { getFontFamilyForLanguage, useProjectFonts } from "./fonts";
import { KeyMetricOrFactScene } from "./scenes/KeyMetricOrFactScene";
import { SplitExplainerScene } from "./scenes/SplitExplainerScene";
import { StepByStepFlowScene } from "./scenes/StepByStepFlowScene";
import { SummaryTakeawayScene } from "./scenes/SummaryTakeawayScene";
import { TitleHeroScene } from "./scenes/TitleHeroScene";
import type { Scene, VideoProject } from "./types";
import { getThemePalette, type ThemePalette } from "./utils/themeStyles";

interface SceneSwitchProps {
  scene: Scene;
  palette: ThemePalette;
  fontFamily: string;
  project: VideoProject;
}

const SceneContent: React.FC<SceneSwitchProps> = ({
  scene,
  palette,
  fontFamily,
  project,
}) => {
  switch (scene.type) {
    case "TITLE_HERO":
      return (
        <TitleHeroScene
          scene={scene}
          palette={palette}
          theme={project.theme}
          language={project.language}
          fontFamily={fontFamily}
          topic={project.topic}
        />
      );
    case "SPLIT_EXPLAINER":
      return (
        <SplitExplainerScene
          scene={scene}
          palette={palette}
          theme={project.theme}
          language={project.language}
          fontFamily={fontFamily}
        />
      );
    case "KEY_METRIC_OR_FACT":
      return (
        <KeyMetricOrFactScene
          scene={scene}
          palette={palette}
          theme={project.theme}
          language={project.language}
          fontFamily={fontFamily}
        />
      );
    case "STEP_BY_STEP_FLOW":
      return (
        <StepByStepFlowScene
          scene={scene}
          palette={palette}
          theme={project.theme}
          language={project.language}
          fontFamily={fontFamily}
        />
      );
    case "SUMMARY_TAKEAWAY":
      return (
        <SummaryTakeawayScene
          scene={scene}
          palette={palette}
          theme={project.theme}
          language={project.language}
          fontFamily={fontFamily}
        />
      );
    default:
      return (
        <SplitExplainerScene
          scene={scene}
          palette={palette}
          theme={project.theme}
          language={project.language}
          fontFamily={fontFamily}
        />
      );
  }
};

export const VideoComposition: React.FC<VideoProject> = (project) => {
  useProjectFonts();

  const { width, height } = useVideoConfig();
  const isPortrait = height > width;
  const themeId = project.theme ?? "cyber_dark";
  const language = project.language ?? "en-IN";
  const fontFamily = getFontFamilyForLanguage(language);
  const rootPalette = getThemePalette(themeId);
  const scenes = project.scenes ?? [];

  if (scenes.length === 0) {
    return (
      <AbsoluteFill
        style={{
          fontFamily,
          backgroundColor: rootPalette.background,
          overflow: "hidden",
        }}
      >
        <SceneBackground palette={rootPalette} seedPrefix="empty-fallback" />
      </AbsoluteFill>
    );
  }

  let cumulativeOffset = 0;
  const timeline = scenes.map((scene) => {
    const from = cumulativeOffset;
    const durationInFrames = Math.max(1, Math.round(scene.durationInFrames || 150));
    cumulativeOffset += durationInFrames;
    return {
      scene,
      from,
      durationInFrames,
    };
  });

  return (
    <AbsoluteFill
      style={{
        fontFamily,
        backgroundColor: rootPalette.background,
        overflow: "hidden",
      }}
    >
      {timeline.map(({ scene, from, durationInFrames }, index) => {
        const scenePalette = getThemePalette(themeId, scene.accentColor);
        const audioSrc = scene.audioUrl?.trim();

        return (
          <Sequence
            key={scene.id || `scene-${index}`}
            from={from}
            durationInFrames={durationInFrames}
            name={`${index + 1}-${scene.type}`}
          >
            <SceneContent
              scene={scene}
              palette={scenePalette}
              fontFamily={fontFamily}
              project={project}
            />

            {audioSrc ? <Audio src={audioSrc} /> : null}

            <KaraokeCaptionsOverlay
              scene={scene}
              palette={scenePalette}
              fontFamily={fontFamily}
              isPortrait={isPortrait}
              canvasWidth={width}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
