import React, { useId } from "react";
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

interface ParsedHighlightMetric {
  isNumeric: boolean;
  prefix: string;
  targetValue: number;
  decimals: number;
  useCommas: boolean;
  suffix: string;
  raw: string;
}

/**
 * Extracts a count-up numeric target from highlightWord (e.g., "99.9%", "299,792 km/s", "1,500+")
 * while keeping formulas/chemical notations (e.g., "V = I × R", "O(log n)", "H2O") intact.
 */
function parseMetricHighlight(rawText: string): ParsedHighlightMetric {
  const clean = rawText.trim();
  if (!clean || /[=()]/.test(clean) || /[a-zA-Z]\d/.test(clean)) {
    return {
      isNumeric: false,
      prefix: "",
      targetValue: 0,
      decimals: 0,
      useCommas: false,
      suffix: "",
      raw: clean,
    };
  }

  const match = /^([^0-9+-]*[+-]?)(\d[\d,]*(?:\.\d+)?)(.*)$/.exec(clean);
  if (!match) {
    return {
      isNumeric: false,
      prefix: "",
      targetValue: 0,
      decimals: 0,
      useCommas: false,
      suffix: "",
      raw: clean,
    };
  }

  const [, prefix, numToken, suffix] = match;
  const normalizedNum = numToken.replace(/,/g, "");
  const targetValue = Number.parseFloat(normalizedNum);
  if (!Number.isFinite(targetValue)) {
    return {
      isNumeric: false,
      prefix: "",
      targetValue: 0,
      decimals: 0,
      useCommas: false,
      suffix: "",
      raw: clean,
    };
  }

  const decimalMatch = /\.(\d+)$/.exec(normalizedNum);
  const decimals = decimalMatch ? decimalMatch[1].length : 0;
  const useCommas = numToken.includes(",");

  return {
    isNumeric: true,
    prefix,
    targetValue,
    decimals,
    useCommas,
    suffix,
    raw: clean,
  };
}

function formatMetricNumber(
  value: number,
  decimals: number,
  useCommas: boolean
): string {
  if (useCommas) {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }
  return decimals > 0 ? value.toFixed(decimals) : String(Math.round(value));
}

/**
 * Key Metric / Formula / Highlighted Fact scene.
 * Replaces unsupported CSS conic-gradient with an inline SVG <rect> animated <linearGradient>
 * stroke border (strokeDasharray / strokeDashoffset) + soft outer boxShadow glow.
 */
export const KeyMetricOrFactScene: React.FC<SceneComponentProps> = ({
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
  const rawId = useId();
  const gradientId = `metric-border-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const cardEntrance = spring({
    frame,
    fps: 30,
    config: { damping: 13, mass: 0.85 },
  });
  const cardScale = interpolate(cardEntrance, [0, 1], [0.88, 1]);
  const cardOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const cardWidth = isPortrait ? width - 120 : 1380;
  const cardHeight = isPortrait ? 900 : 640;
  const strokeInset = 4;
  const rectW = cardWidth - strokeInset * 2;
  const rectH = cardHeight - strokeInset * 2;
  const perimeter = 2 * (rectW + rectH);

  // Border draws in over frames 0..32, then glowing arc orbits continuously around perimeter
  const borderReveal = interpolate(frame, [0, 32], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const arcLength = Math.max(40, perimeter * 0.36 * borderReveal);
  const dashOffset = -((frame * 12) % perimeter);

  const highlightRaw = scene.highlightWord?.trim()
    ? clampText(scene.highlightWord, 30)
    : "";
  const parsedMetric = parseMetricHighlight(highlightRaw);

  let displayMetric = highlightRaw;
  if (parsedMetric.isNumeric) {
    const animatedVal = interpolate(frame, [0, 30], [0, parsedMetric.targetValue], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    displayMetric = `${parsedMetric.prefix}${formatMetricNumber(
      animatedVal,
      parsedMetric.decimals,
      parsedMetric.useCommas
    )}${parsedMetric.suffix}`;
  }

  const metricPop = spring({
    frame: Math.max(0, frame - 4),
    fps: 30,
    config: { damping: 12, mass: 0.8 },
  });

  const headingText = clampText(scene.heading, 80);
  const headingFit = computeFittedMultilineText({
    text: headingText,
    maxLines: 2,
    maxBoxWidth: cardWidth - 140,
    fontFamily,
    fontWeight: 700,
    maxFontSize: isPortrait ? 44 : 44,
    minFontSize: 26,
  });

  const metricFontSize = displayMetric
    ? computeFittedFontSize({
        text: parsedMetric.isNumeric ? highlightRaw : displayMetric,
        withinWidth: cardWidth - 140,
        fontFamily,
        fontWeight: 800,
        maxFontSize: isPortrait ? 104 : 118,
        minFontSize: 44,
      })
    : 0;

  const subtextText = scene.subtext ? clampText(scene.subtext, 160) : "";
  const subtextFit = subtextText
    ? computeFittedMultilineText({
        text: subtextText,
        maxLines: isPortrait ? 4 : 3,
        maxBoxWidth: cardWidth - 160,
        fontFamily,
        fontWeight: 500,
        maxFontSize: isPortrait ? 32 : 30,
        minFontSize: 20,
      })
    : null;

  const chips = (scene.bulletPoints ?? [])
    .map((b) => clampText(b, 48))
    .filter((b) => b.length > 0)
    .slice(0, 3);

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <SceneBackground
        palette={palette}
        seedPrefix={`metric-${scene.id}`}
        particleCount={16}
        variant="metric"
      />

      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: isPortrait ? 110 : 72,
          paddingBottom: isPortrait ? 290 : 190,
          paddingLeft: isPortrait ? 60 : 120,
          paddingRight: isPortrait ? 60 : 120,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            position: "relative",
            width: cardWidth,
            height: cardHeight,
            borderRadius: 34,
            backgroundColor: palette.surface,
            boxShadow: `0 24px 64px ${palette.accentGlow}`,
            opacity: cardOpacity,
            transform: `scale(${cardScale})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: isPortrait ? "48px 52px" : "44px 70px",
            boxSizing: "border-box",
            textAlign: "center",
          }}
        >
          {/* Animated inline SVG gradient border replacing CSS conic-gradient */}
          <svg
            width={cardWidth}
            height={cardHeight}
            viewBox={`0 0 ${cardWidth} ${cardHeight}`}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              pointerEvents: "none",
            }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={palette.accent} />
                <stop offset="50%" stopColor={palette.accentSecondary} />
                <stop offset="100%" stopColor={palette.accent} />
              </linearGradient>
            </defs>

            {/* Base translucent border track */}
            <rect
              x={strokeInset}
              y={strokeInset}
              width={rectW}
              height={rectH}
              rx={30}
              ry={30}
              fill="none"
              stroke={palette.border}
              strokeWidth={2}
            />

            {/* Animated glowing gradient border sweep */}
            <rect
              x={strokeInset}
              y={strokeInset}
              width={rectW}
              height={rectH}
              rx={30}
              ry={30}
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth={5}
              strokeLinecap="round"
              strokeDasharray={`${arcLength} ${Math.max(1, perimeter - arcLength)}`}
              strokeDashoffset={dashOffset}
            />
          </svg>

          {/* Header Icon + Label */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              marginBottom: isPortrait ? 28 : 20,
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 18,
                backgroundColor: palette.accentSoft,
                border: `1.5px solid ${hexToRgba(palette.accent, 0.45)}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <DynamicIcon
                name={scene.iconName}
                size={34}
                color={palette.accent}
                strokeWidth={2.2}
              />
            </div>

            <h2
              style={{
                margin: 0,
                fontFamily,
                fontSize: headingFit.fontSize,
                fontWeight: 700,
                lineHeight: 1.2,
                color: palette.textSecondary,
                textAlign: "left",
              }}
            >
              {headingText}
            </h2>
          </div>

          {/* Primary Numeric Stat / Formula Highlight */}
          {displayMetric ? (
            <div
              style={{
                marginTop: isPortrait ? 12 : 6,
                marginBottom: isPortrait ? 28 : 22,
                transform: `scale(${interpolate(metricPop, [0, 1], [0.85, 1])})`,
                padding: isPortrait ? "18px 34px" : "14px 40px",
                borderRadius: 24,
                backgroundColor: palette.accentSoft,
                border: `1.5px solid ${hexToRgba(palette.accent, 0.42)}`,
                boxShadow: `0 12px 32px ${hexToRgba(palette.accent, 0.2)}`,
              }}
            >
              <span
                style={{
                  fontFamily,
                  fontSize: metricFontSize,
                  fontWeight: 800,
                  lineHeight: 1.15,
                  color: palette.accent,
                  fontVariantNumeric: "tabular-nums",
                  display: "block",
                }}
              >
                {displayMetric}
              </span>
            </div>
          ) : null}

          {/* Supporting Fact / Explanation */}
          {subtextFit && (
            <p
              style={{
                margin: 0,
                fontFamily,
                fontSize: subtextFit.fontSize,
                fontWeight: 500,
                lineHeight: 1.42,
                color: palette.textPrimary,
                maxWidth: cardWidth - 160,
                opacity: interpolate(frame, [10, 26], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            >
              {subtextText}
            </p>
          )}

          {/* Optional supporting metric chips */}
          {chips.length > 0 && (
            <div
              style={{
                marginTop: isPortrait ? 32 : 24,
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 14,
                opacity: interpolate(frame, [18, 34], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            >
              {chips.map((chip, idx) => (
                <div
                  key={`${idx}-${chip.slice(0, 10)}`}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 9999,
                    backgroundColor: palette.surfaceElevated,
                    border: `1px solid ${palette.border}`,
                    fontFamily,
                    fontSize: isPortrait ? 22 : 21,
                    fontWeight: 600,
                    color: palette.textSecondary,
                  }}
                >
                  {chip}
                </div>
              ))}
            </div>
          )}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
