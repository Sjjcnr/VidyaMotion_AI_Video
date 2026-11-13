import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { DynamicIcon } from "../../components/DynamicIcon";
import { SceneBackground } from "../../components/SceneBackground";
import { getFontFamilyForLanguage } from "../../fonts";
import type { LanguageCode, Scene, ThemeId } from "../../types";
import {
  clampText,
  computeFittedFontSize,
  computeFittedMultilineText,
  getThemePalette,
  hexToRgba,
  type ThemePalette,
} from "../../utils/themeStyles";

export interface SceneComponentProps {
  scene: Scene;
  palette?: ThemePalette;
  theme?: ThemeId;
  language?: LanguageCode;
  fontFamily?: string;
  topic?: string;
}

/**
 * Opening hero scene with ambient glowing radials, floating particles,
 * spring scale pop (0.8 -> 1.0), opacity fade-in, and staggered topic tag & subtext.
 */
export const TitleHeroScene: React.FC<SceneComponentProps> = ({
  scene,
  palette: paletteProp,
  theme = "cyber_dark",
  language = "en-IN",
  fontFamily: fontFamilyProp,
  topic,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const isPortrait = height > width;
  const palette = paletteProp ?? getThemePalette(theme, scene.accentColor);
  const fontFamily = fontFamilyProp ?? getFontFamilyForLanguage(language);

  // Required TitleHeroScene entrance mechanics
  const scaleSpring = spring({
    frame,
    fps: 30,
    config: { damping: 12, mass: 0.8 },
  });
  const heroScale = interpolate(scaleSpring, [0, 1], [0.8, 1.0]);
  const heroOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Staggered Topic Tag badge entrance
  const badgeSpring = spring({
    frame: Math.max(0, frame - 6),
    fps: 30,
    config: { damping: 14, mass: 0.75 },
  });
  const badgeOpacity = interpolate(frame, [4, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const badgeTranslateY = interpolate(badgeSpring, [0, 1], [18, 0]);

  // Staggered icon emblem & divider
  const iconSpring = spring({
    frame: Math.max(0, frame - 2),
    fps: 30,
    config: { damping: 11, mass: 0.75 },
  });
  const iconFloatY = Math.sin((frame / 30) * Math.PI * 1.4) * 6;

  // Staggered subtext entrance
  const subtextSpring = spring({
    frame: Math.max(0, frame - 14),
    fps: 30,
    config: { damping: 15, mass: 0.85 },
  });
  const subtextOpacity = interpolate(frame, [12, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subtextTranslateY = interpolate(subtextSpring, [0, 1], [24, 0]);

  const dividerProgress = interpolate(frame, [10, 32], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const safeMaxWidth = isPortrait ? width - 128 : Math.min(1480, width - 240);
  const rawBadge = scene.highlightWord?.trim() || topic?.trim() || "CONCEPT EXPLAINED";
  const badgeText = clampText(rawBadge, 30);
  const badgeFontSize = computeFittedFontSize({
    text: badgeText,
    withinWidth: isPortrait ? 640 : 760,
    fontFamily,
    fontWeight: 700,
    maxFontSize: isPortrait ? 28 : 26,
    minFontSize: 18,
  });

  const headingText = clampText(scene.heading, 80);
  const headingFit = computeFittedMultilineText({
    text: headingText,
    maxLines: isPortrait ? 3 : 2,
    maxBoxWidth: safeMaxWidth,
    fontFamily,
    fontWeight: 800,
    maxFontSize: isPortrait ? 78 : 88,
    minFontSize: 40,
  });

  const subtextText = scene.subtext ? clampText(scene.subtext, 160) : "";
  const subtextFit = subtextText
    ? computeFittedMultilineText({
        text: subtextText,
        maxLines: isPortrait ? 4 : 3,
        maxBoxWidth: isPortrait ? safeMaxWidth - 20 : Math.min(1180, safeMaxWidth),
        fontFamily,
        fontWeight: 500,
        maxFontSize: isPortrait ? 36 : 36,
        minFontSize: 22,
      })
    : null;

  const iconBoxSize = isPortrait ? 132 : 116;

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <SceneBackground
        palette={palette}
        seedPrefix={`hero-${scene.id}`}
        particleCount={20}
        variant="hero"
      />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: isPortrait ? 110 : 72,
          paddingBottom: isPortrait ? 300 : 190,
          paddingLeft: isPortrait ? 64 : 120,
          paddingRight: isPortrait ? 64 : 120,
          boxSizing: "border-box",
          textAlign: "center",
        }}
      >
        {/* Floating glowing emblem */}
        <div
          style={{
            width: iconBoxSize,
            height: iconBoxSize,
            borderRadius: 32,
            backgroundColor: palette.surface,
            border: `2px solid ${palette.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: isPortrait ? 38 : 28,
            boxShadow: `0 18px 48px ${palette.accentGlow}`,
            opacity: heroOpacity,
            transform: `translateY(${iconFloatY}px) scale(${interpolate(iconSpring, [0, 1], [0.7, 1])})`,
          }}
        >
          <DynamicIcon
            name={scene.iconName}
            size={isPortrait ? 64 : 56}
            color={palette.accent}
            strokeWidth={2.1}
          />
        </div>

        {/* Staggered Topic Tag Badge */}
        <div
          style={{
            opacity: badgeOpacity,
            transform: `translateY(${badgeTranslateY}px)`,
            marginBottom: isPortrait ? 32 : 24,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: isPortrait ? "12px 28px" : "10px 26px",
            borderRadius: 9999,
            backgroundColor: palette.accentSoft,
            border: `1.5px solid ${hexToRgba(palette.accent, 0.55)}`,
            boxShadow: `0 8px 24px ${hexToRgba(palette.accent, 0.22)}`,
          }}
        >
          <span
            style={{
              fontFamily,
              fontSize: badgeFontSize,
              fontWeight: 700,
              color: palette.accent,
              letterSpacing: "0.04em",
              lineHeight: 1.25,
            }}
          >
            {badgeText}
          </span>
        </div>

        {/* Hero Kinetic Heading */}
        <div
          style={{
            opacity: heroOpacity,
            transform: `scale(${heroScale})`,
            maxWidth: safeMaxWidth,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontFamily,
              fontSize: headingFit.fontSize,
              fontWeight: 800,
              lineHeight: 1.18,
              color: palette.textPrimary,
              textAlign: "center",
              textShadow: palette.isDark
                ? `0 6px 28px ${hexToRgba(palette.accent, 0.25)}`
                : "none",
            }}
          >
            {headingText}
          </h1>

          {/* Animated accent divider bar */}
          <div
            style={{
              marginTop: isPortrait ? 34 : 26,
              marginBottom: isPortrait ? 34 : 26,
              width: Math.round((isPortrait ? 240 : 280) * dividerProgress),
              height: 6,
              borderRadius: 9999,
              backgroundImage: `linear-gradient(90deg, ${palette.accent}, ${palette.accentSecondary})`,
              boxShadow: `0 4px 18px ${palette.accentGlow}`,
            }}
          />
        </div>

        {/* Staggered Subtext */}
        {subtextFit && (
          <div
            style={{
              opacity: subtextOpacity,
              transform: `translateY(${subtextTranslateY}px)`,
              maxWidth: isPortrait ? safeMaxWidth - 20 : Math.min(1180, safeMaxWidth),
              width: "100%",
            }}
          >
            <p
              style={{
                margin: 0,
                fontFamily,
                fontSize: subtextFit.fontSize,
                fontWeight: 500,
                lineHeight: 1.42,
                color: palette.textSecondary,
                textAlign: "center",
              }}
            >
              {subtextText}
            </p>
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
