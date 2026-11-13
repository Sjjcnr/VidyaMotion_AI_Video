import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { CaptionWord, Scene } from "../types";
import {
  buildEstimatedCaptionsFromScript,
  buildTikTokCaptionPages,
  getActiveCaptionPage,
} from "../utils/captions";
import { computeFittedFontSize, type ThemePalette } from "../utils/themeStyles";

const TRAILING_PUNCT_RE = /^[.,!?;:…\u0964\u0965)\]]+$/;

/**
 * Attaches standalone punctuation tokens (e.g. ",", ".", "।") and inline hyphens
 * onto adjacent words so fallback estimated captions never render orphan punctuation pills
 * or spaces before commas/periods.
 */
function normalizeCaptionWords(words: readonly CaptionWord[]): CaptionWord[] {
  const merged: CaptionWord[] = [];

  for (let i = 0; i < words.length; i++) {
    const raw = words[i];
    const clean = raw.text.trim();
    if (!clean) {
      continue;
    }

    if (TRAILING_PUNCT_RE.test(clean)) {
      if (merged.length > 0) {
        const prev = merged[merged.length - 1];
        prev.text = `${prev.text}${clean}`;
        prev.endMs = Math.max(prev.endMs, raw.endMs);
      }
      continue;
    }

    if (
      clean === "-" &&
      merged.length > 0 &&
      i + 1 < words.length &&
      /^[A-Za-z0-9\u0900-\u097F\u0A80-\u0AFF]/.test(words[i + 1].text.trim())
    ) {
      const next = words[i + 1];
      const prev = merged[merged.length - 1];
      prev.text = `${prev.text}-${next.text.trim()}`;
      prev.endMs = Math.max(prev.endMs, next.endMs);
      i += 1;
      continue;
    }

    merged.push({
      text: clean,
      startMs: raw.startMs,
      endMs: raw.endMs,
    });
  }

  return merged;
}

export interface KaraokeCaptionsOverlayProps {
  scene: Scene;
  palette: ThemePalette;
  fontFamily: string;
  isPortrait: boolean;
  canvasWidth: number;
}

/**
 * TikTok/Reels-style word-level karaoke subtitle overlay.
 * Preserves Indic conjuncts/matras (never splits character-by-character), uses solid translucent
 * captionBg (no backdropFilter), and highlights the active spoken token in neon yellow pill.
 */
export const KaraokeCaptionsOverlay: React.FC<KaraokeCaptionsOverlayProps> = ({
  scene,
  palette,
  fontFamily,
  isPortrait,
  canvasWidth,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timeMs = (frame / Math.max(1, fps)) * 1000;

  const pages = useMemo(() => {
    const fallbackDuration =
      scene.durationInSeconds ?? scene.durationInFrames / Math.max(1, fps);
    const rawWords =
      scene.captions && scene.captions.length > 0
        ? scene.captions
        : buildEstimatedCaptionsFromScript(scene.narrationScript, fallbackDuration);
    const words = normalizeCaptionWords(rawWords);

    return buildTikTokCaptionPages({
      words,
      combineTokensWithinMilliseconds: isPortrait ? 1150 : 1400,
      breakOnSilenceAfterMilliseconds: 450,
    });
  }, [
    fps,
    isPortrait,
    scene.captions,
    scene.durationInFrames,
    scene.durationInSeconds,
    scene.narrationScript,
  ]);

  const activePage = getActiveCaptionPage(pages, timeMs);
  if (!activePage || activePage.tokens.length === 0) {
    return null;
  }

  const horizontalMargin = isPortrait ? 48 : 110;
  const maxContainerWidth = isPortrait
    ? Math.max(320, canvasWidth - horizontalMargin * 2)
    : Math.min(1440, canvasWidth - horizontalMargin * 2);

  const pageText = activePage.text.replace(/\s+/g, " ").trim();
  const baseMaxFontSize = isPortrait ? 38 : 34;
  const baseMinFontSize = isPortrait ? 24 : 24;

  // Scale down only if a caption page is unusually wide so it fits cleanly within 2 lines
  const fittedSingleLine = computeFittedFontSize({
    text: pageText,
    withinWidth: (maxContainerWidth - 64) * 1.85,
    fontFamily,
    fontWeight: 700,
    maxFontSize: baseMaxFontSize,
    minFontSize: baseMinFontSize,
  });

  const fontSize = Math.min(baseMaxFontSize, fittedSingleLine);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: isPortrait ? 108 : 40,
        display: "flex",
        justifyContent: "center",
        paddingLeft: horizontalMargin,
        paddingRight: horizontalMargin,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap: isPortrait ? "6px 8px" : "6px 10px",
          maxWidth: maxContainerWidth,
          backgroundColor: palette.captionBg,
          border: `1px solid ${palette.border}`,
          borderRadius: isPortrait ? 22 : 18,
          padding: isPortrait ? "14px 22px" : "12px 26px",
          boxShadow: "0 12px 32px rgba(0, 0, 0, 0.45)",
          fontFamily,
        }}
      >
        {activePage.tokens.map((token, index) => {
          const cleanWord = token.text.trim();
          if (!cleanWord) {
            return null;
          }

          const isActive = token.fromMs <= timeMs && timeMs < token.toMs;
          const hasSpoken = timeMs >= token.toMs;

          return (
            <span
              key={`${index}-${token.fromMs}-${cleanWord}`}
              style={{
                display: "inline-block",
                padding: isPortrait ? "4px 12px" : "4px 12px",
                borderRadius: 10,
                backgroundColor: isActive
                  ? palette.captionHighlightBg
                  : "transparent",
                color: isActive
                  ? palette.captionHighlightText
                  : palette.captionText,
                opacity: isActive ? 1 : hasSpoken ? 0.94 : 0.86,
                fontSize,
                fontWeight: isActive ? 800 : 600,
                lineHeight: 1.32,
                fontFamily,
              }}
            >
              {cleanWord}
            </span>
          );
        })}
      </div>
    </div>
  );
};
