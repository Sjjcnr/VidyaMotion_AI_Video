import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { DynamicIcon } from "../components/DynamicIcon";
import { SceneBackground } from "../components/SceneBackground";
import { getFontFamilyForLanguage } from "../fonts";
import {
  clampText,
  computeFittedFontSize,
  computeFittedMultilineText,
  getThemePalette,
  hexToRgba,
} from "../utils/themeStyles";
import type { SceneComponentProps } from "./TitleHeroScene";

/**
 * 50/50 split explainer (row in 16:9, column in 9:16).
 * Visual card features floating DynamicIcon, pulsing concentric circles, and outer glow;
 * Content side staggers bullet points every 20 frames (or renders subtext gracefully if empty).
 */
export const SplitExplainerScene: React.FC<SceneComponentProps> = ({
  scene,
  palette: paletteProp,
  theme = "cyber_dark",
  language = "en-IN",
  fontFamily: fontFamilyProp,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const isPortrait = height > width;
  const palette = paletteProp ?? getThemePalette(theme, scene.accentColor);
  const fontFamily = fontFamilyProp ?? getFontFamilyForLanguage(language);

  const cardEntrance = spring({
    frame,
    fps: 30,
    config: { damping: 14, mass: 0.85 },
  });
  const cardOpacity = interpolate(frame, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const headingOpacity = interpolate(frame, [2, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const headingSpring = spring({
    frame,
    fps: 30,
    config: { damping: 15, mass: 0.8 },
  });

  const floatY = Math.sin((frame / 30) * Math.PI * 1.5) * 10;

  // Safe inner bounds avoiding bottom karaoke captions
  const padX = isPortrait ? 64 : 96;
  const padTop = isPortrait ? 104 : 76;
  const padBottom = isPortrait ? 290 : 196;
  const gap = isPortrait ? 44 : 64;

  const usableWidth = width - padX * 2;
  const usableHeight = height - padTop - padBottom;

  const visualCardWidth = isPortrait ? usableWidth : Math.round((usableWidth - gap) * 0.44);
  const visualCardHeight = isPortrait ? Math.round(usableHeight * 0.36) : Math.min(680, usableHeight);
  const contentColWidth = isPortrait ? usableWidth : usableWidth - visualCardWidth - gap;

  const headingText = clampText(scene.heading, 80);
  const headingFit = computeFittedMultilineText({
    text: headingText,
    maxLines: 2,
    maxBoxWidth: contentColWidth,
    fontFamily,
    fontWeight: 800,
    maxFontSize: isPortrait ? 58 : 60,
    minFontSize: 32,
  });

  const subtextText = scene.subtext ? clampText(scene.subtext, 160) : "";
  const rawBullets = (scene.bulletPoints ?? [])
    .map((b) => b.trim())
    .filter((b) => b.length > 0)
    .slice(0, 4);

  const badgeText = scene.highlightWord?.trim()
    ? clampText(scene.highlightWord, 30)
    : "";
  const badgeFontSize = badgeText
    ? computeFittedFontSize({
        text: badgeText,
        withinWidth: visualCardWidth - 80,
        fontFamily,
        fontWeight: 700,
        maxFontSize: 24,
        minFontSize: 16,
      })
    : 22;

  const ringBaseSize = isPortrait ? 230 : 320;
  const pulseCycle1 = ((frame % 75) / 75);
  const pulseCycle2 = (((frame + 37) % 75) / 75);

  const ring1Scale = interpolate(pulseCycle1, [0, 1], [0.75, 1.32]);
  const ring1Opacity = interpolate(pulseCycle1, [0, 0.25, 1], [0, 0.55, 0]);

  const ring2Scale = interpolate(pulseCycle2, [0, 1], [0.75, 1.32]);
  const ring2Opacity = interpolate(pulseCycle2, [0, 0.25, 1], [0, 0.45, 0]);

  const subtextFallbackFit =
    rawBullets.length === 0 && subtextText
      ? computeFittedMultilineText({
          text: subtextText,
          maxLines: isPortrait ? 5 : 4,
          maxBoxWidth: contentColWidth - 72,
          fontFamily,
          fontWeight: 500,
          maxFontSize: isPortrait ? 34 : 34,
          minFontSize: 22,
        })
      : null;

  const subtextLeadFit =
    rawBullets.length > 0 && subtextText
      ? computeFittedMultilineText({
          text: subtextText,
          maxLines: 2,
          maxBoxWidth: contentColWidth,
          fontFamily,
          fontWeight: 500,
          maxFontSize: isPortrait ? 28 : 26,
          minFontSize: 18,
        })
      : null;

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <SceneBackground
        palette={palette}
        seedPrefix={`split-${scene.id}`}
        particleCount={16}
        variant="split"
      />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: isPortrait ? "column" : "row",
          alignItems: "center",
          justifyContent: "center",
          gap,
          paddingLeft: padX,
          paddingRight: padX,
          paddingTop: padTop,
          paddingBottom: padBottom,
          boxSizing: "border-box",
        }}
      >
        {/* Visual Concept Card (Left in 16:9, Top in 9:16) */}
        <div
          style={{
            width: visualCardWidth,
            height: visualCardHeight,
            flexShrink: 0,
            borderRadius: 32,
            backgroundColor: palette.surface,
            border: `1.5px solid ${palette.border}`,
            boxShadow: `0 22px 56px ${palette.accentGlow}`,
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: cardOpacity,
            transform: `scale(${interpolate(cardEntrance, [0, 1], [0.92, 1])})`,
          }}
        >
          {/* Centered subtle ambient core inside card */}
          <div
            style={{
              position: "absolute",
              width: ringBaseSize * 1.4,
              height: ringBaseSize * 1.4,
              borderRadius: 9999,
              backgroundImage: `radial-gradient(circle, ${hexToRgba(palette.accent, 0.22)} 0%, ${hexToRgba(palette.accent, 0)} 70%)`,
              pointerEvents: "none",
            }}
          />

          {/* Pulsing concentric circular wave 1 */}
          <div
            style={{
              position: "absolute",
              width: ringBaseSize,
              height: ringBaseSize,
              borderRadius: 9999,
              border: `2px solid ${palette.accent}`,
              opacity: ring1Opacity,
              transform: `scale(${ring1Scale})`,
              pointerEvents: "none",
            }}
          />

          {/* Pulsing concentric circular wave 2 */}
          <div
            style={{
              position: "absolute",
              width: ringBaseSize,
              height: ringBaseSize,
              borderRadius: 9999,
              border: `2px solid ${palette.accentSecondary}`,
              opacity: ring2Opacity,
              transform: `scale(${ring2Scale})`,
              pointerEvents: "none",
            }}
          />

          {/* Static inner halo ring */}
          <div
            style={{
              position: "absolute",
              width: Math.round(ringBaseSize * 0.62),
              height: Math.round(ringBaseSize * 0.62),
              borderRadius: 9999,
              backgroundColor: palette.accentSoft,
              border: `2px solid ${hexToRgba(palette.accent, 0.45)}`,
              boxShadow: `0 12px 32px ${hexToRgba(palette.accent, 0.25)}`,
              transform: `translateY(${floatY * 0.5}px)`,
              pointerEvents: "none",
            }}
          />

          {/* Floating Lucide Concept Icon */}
          <div
            style={{
              position: "relative",
              transform: `translateY(${floatY}px)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <DynamicIcon
              name={scene.iconName}
              size={isPortrait ? 96 : 116}
              color={palette.accent}
              strokeWidth={1.9}
            />
          </div>

          {/* Optional highlight tag pill inside concept card */}
          {badgeText && (
            <div
              style={{
                position: "absolute",
                bottom: isPortrait ? 22 : 30,
                padding: "8px 22px",
                borderRadius: 9999,
                backgroundColor: palette.surfaceElevated,
                border: `1.5px solid ${hexToRgba(palette.accent, 0.45)}`,
                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.28)",
              }}
            >
              <span
                style={{
                  fontFamily,
                  fontSize: badgeFontSize,
                  fontWeight: 700,
                  color: palette.accent,
                  lineHeight: 1.25,
                }}
              >
                {badgeText}
              </span>
            </div>
          )}
        </div>

        {/* Structured Content Panel (Right in 16:9, Bottom in 9:16) */}
        <div
          style={{
            width: contentColWidth,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: isPortrait ? 22 : 24,
          }}
        >
          <div
            style={{
              opacity: headingOpacity,
              transform: `translateY(${interpolate(headingSpring, [0, 1], [18, 0])}px)`,
            }}
          >
            <h2
              style={{
                margin: 0,
                fontFamily,
                fontSize: headingFit.fontSize,
                fontWeight: 800,
                lineHeight: 1.18,
                color: palette.textPrimary,
              }}
            >
              {headingText}
            </h2>

            {subtextLeadFit && (
              <p
                style={{
                  margin: "12px 0 0 0",
                  fontFamily,
                  fontSize: subtextLeadFit.fontSize,
                  fontWeight: 500,
                  lineHeight: 1.38,
                  color: palette.textSecondary,
                }}
              >
                {subtextText}
              </p>
            )}
          </div>

          {/* Staggered bullet cards (20 frames apart per Section 4) */}
          {rawBullets.length > 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: isPortrait ? 18 : 20,
              }}
            >
              {rawBullets.map((bullet, index) => {
                const bulletText = clampText(bullet, 100);
                const delayedFrame = Math.max(0, frame - index * 20);
                const bulletProgress = spring({
                  frame: delayedFrame,
                  fps: 30,
                  config: { damping: 14, mass: 0.8 },
                });
                const bulletOpacity = interpolate(delayedFrame, [0, 12], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                });
                const slideOffset = interpolate(bulletProgress, [0, 1], [32, 0]);
                const bulletFit = computeFittedMultilineText({
                  text: bulletText,
                  maxLines: 2,
                  maxBoxWidth: contentColWidth - (isPortrait ? 124 : 136),
                  fontFamily,
                  fontWeight: 600,
                  maxFontSize: rawBullets.length >= 4 ? (isPortrait ? 28 : 27) : (isPortrait ? 31 : 30),
                  minFontSize: 20,
                });

                return (
                  <div
                    key={`${index}-${bulletText.slice(0, 12)}`}
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 20,
                      padding: isPortrait ? "20px 24px" : "20px 26px",
                      borderRadius: 20,
                      backgroundColor: palette.surface,
                      border: `1.5px solid ${palette.border}`,
                      boxShadow: "0 10px 28px rgba(0, 0, 0, 0.25)",
                      opacity: bulletOpacity,
                      transform: isPortrait
                        ? `translateY(${slideOffset}px)`
                        : `translateX(${slideOffset}px)`,
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        flexShrink: 0,
                        backgroundColor: palette.accentSoft,
                        border: `1.5px solid ${hexToRgba(palette.accent, 0.5)}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily,
                        fontSize: 22,
                        fontWeight: 800,
                        color: palette.accent,
                      }}
                    >
                      {`0${index + 1}`}
                    </div>

                    <p
                      style={{
                        margin: 0,
                        fontFamily,
                        fontSize: bulletFit.fontSize,
                        fontWeight: 600,
                        lineHeight: 1.32,
                        color: palette.textPrimary,
                      }}
                    >
                      {bulletText}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : subtextFallbackFit ? (
            <div
              style={{
                padding: isPortrait ? "28px 30px" : "32px 36px",
                borderRadius: 24,
                backgroundColor: palette.surface,
                border: `1.5px solid ${palette.border}`,
                boxShadow: "0 12px 32px rgba(0, 0, 0, 0.28)",
                opacity: interpolate(frame, [10, 26], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontFamily,
                  fontSize: subtextFallbackFit.fontSize,
                  fontWeight: 500,
                  lineHeight: 1.45,
                  color: palette.textSecondary,
                }}
              >
                {subtextText}
              </p>
            </div>
          ) : null}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
