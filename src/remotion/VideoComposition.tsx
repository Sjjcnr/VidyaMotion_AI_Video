import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { DynamicSceneRunner } from "./components/DynamicSceneRunner";
import { KaraokeCaptionsOverlay } from "./components/KaraokeCaptionsOverlay";
import { SceneBackground } from "./components/SceneBackground";
import { getFontFamilyForLanguage, useProjectFonts } from "./fonts";
import type { VideoProject } from "./types";
import { getThemePalette } from "./utils/themeStyles";

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
      <style>{`
        svg text, svg tspan {
          font-family: ${fontFamily}, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }
      `}</style>
      {timeline.map(({ scene, from, durationInFrames }, index) => {
        const scenePalette = getThemePalette(themeId, scene.accentColor);
        const audioSrc = scene.audioUrl?.trim();

        return (
          <Sequence
            key={scene.id || `scene-${index}`}
            from={from}
            durationInFrames={durationInFrames}
            name={`scene-${index + 1}`}
          >
            {/* Dynamic AI Code Runner with In-Browser Sucrase Compilation & ErrorBoundary */}
            <DynamicSceneRunner
              scene={scene}
              palette={scenePalette}
              fontFamily={fontFamily}
              project={project}
              isPortrait={isPortrait}
            />

            {/* Mathematically Locked Synchronized Audio Track */}
            {audioSrc ? <Audio src={audioSrc} /> : null}

            {/* Karaoke Word-Level Captions Overlay */}
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
