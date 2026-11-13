import { Check } from "lucide-react";
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
import {
  clampText,
  computeFittedFontSize,
  computeFittedMultilineText,
  getThemePalette,
  hexToRgba,
} from "../../utils/themeStyles";
import type { SceneComponentProps } from "./TitleHeroScene";

export const SummaryTakeawayScene: React.FC<SceneComponentProps> = ({
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

  const rawItems = (scene.bulletPoints ?? [])
    .map((b) => b.trim())
    .filter((b) => b.length > 0)
    .slice(0, 4);

  const items =
    rawItems.length > 0
      ? rawItems
      : [scene.subtext?.trim() || scene.heading.trim()];

  const padX = isPortrait ? 64 : 130;
  const padTop = isPortrait ? 104 : 74;
  const padBottom = isPortrait ? 290 : 196;
  const usableWidth = width - padX * 2;
  const containerWidth = isPortrait ? usableWidth : Math.min(1440, usableWidth);

  const badgeText = clampText(scene.highlightWord?.trim() || "KEY TAKEAWAYS", 30);
  const badgeFontSize = computeFittedFontSize({
    text: badgeText,
    withinWidth: containerWidth - 100,
    fontFamily,
    fontWeight: 700,
    maxFontSize: 22,
    minFontSize: 16,
  });

  const headingText = clampText(scene.heading, 80);
  const headingFit = computeFittedMultilineText({
    text: headingText,
    maxLines: 2,
    maxBoxWidth: containerWidth - 100,
    fontFamily,
    fontWeight: 800,
    maxFontSize: isPortrait ? 54 : 52,
    minFontSize: 30,
  });

  const subtextText =
    rawItems.length > 0 && scene.subtext ? clampText(scene.subtext, 160) : "";
  const subtextFit = subtextText
    ? computeFittedMultilineText({
        text: subtextText,
        maxLines: 2,
        maxBoxWidth: containerWidth - 80,
        fontFamily,
        fontWeight: 500,
        maxFontSize: isPortrait ? 26 : 25,
        minFontSize: 18,
      })
    : null;

  const headerOpacity = interpolate(frame, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const headerSpring = spring({
    frame,
    fps: 30,
    config: { damping: 14, mass: 0.8 },
  });

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <SceneBackground
        palette={palette}
        seedPrefix={`summary-${scene.id}`}
        particleCount={16}
        variant="summary"
      />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: padTop,
          paddingBottom: padBottom,
          paddingLeft: padX,
          paddingRight: padX,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: containerWidth,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: isPortrait ? 30 : 26,
          }}
        >
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              opacity: headerOpacity,
              transform: `translateY(${interpolate(headerSpring, [0, 1], [16, 0])}px)`,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 22px",
                borderRadius: 9999,
                backgroundColor: hexToRgba(palette.successColor, 0.16),
                border: `1.5px solid ${hexToRgba(palette.successColor, 0.5)}`,
                marginBottom: 16,
              }}
            >
              <DynamicIcon
                name={scene.iconName}
                size={24}
                color={palette.successColor}
                strokeWidth={2.2}
              />
              <span
                style={{
                  fontFamily,
                  fontSize: badgeFontSize,
                  fontWeight: 700,
                  color: palette.successColor,
                  letterSpacing: "0.05em",
                }}
              >
                {badgeText}
              </span>
            </div>

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

            {subtextFit && (
              <p
                style={{
                  margin: "12px 0 0 0",
                  fontFamily,
                  fontSize: subtextFit.fontSize,
                  fontWeight: 500,
                  lineHeight: 1.38,
                  color: palette.textSecondary,
                }}
              >
                {subtextText}
              </p>
            )}
          </div>

          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: items.length >= 4 ? (isPortrait ? 18 : 16) : (isPortrait ? 24 : 20),
            }}
          >
            {items.map((rawItem, index) => {
              const itemText = clampText(rawItem, 100);
              const rowStart = 8 + index * 16;
              const rowFrame = Math.max(0, frame - rowStart);

              const rowOpacity = interpolate(rowFrame, [0, 12], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              const rowSlideSpring = spring({
                frame: rowFrame,
                fps: 30,
                config: { damping: 14, mass: 0.8 },
              });
              const rowTranslateY = interpolate(rowSlideSpring, [0, 1], [24, 0]);

              const checkFrame = Math.max(0, frame - (rowStart + 6));
              const checkBounce = spring({
                frame: checkFrame,
                fps: 30,
                config: { damping: 9, stiffness: 185, mass: 0.7 },
              });
              const checkScale = checkFrame > 0 ? checkBounce : 0;
              const checkActivated = checkFrame >= 6;

              const itemFit = computeFittedMultilineText({
                text: itemText,
                maxLines: 2,
                maxBoxWidth: containerWidth - (isPortrait ? 156 : 176),
                fontFamily,
                fontWeight: 600,
                maxFontSize: items.length >= 4 ? (isPortrait ? 29 : 28) : (isPortrait ? 33 : 32),
                minFontSize: 20,
              });

              return (
                <div
                  key={`${index}-${itemText.slice(0, 12)}`}
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: isPortrait ? 20 : 24,
                    padding: items.length >= 4 ? (isPortrait ? "20px 26px" : "18px 28px") : (isPortrait ? "24px 28px" : "22px 32px"),
                    borderRadius: 22,
                    backgroundColor: checkActivated
                      ? palette.surfaceElevated
                      : palette.surface,
                    border: `1.5px solid ${
                      checkActivated
                        ? hexToRgba(palette.successColor, 0.5)
                        : palette.border
                    }`,
                    boxShadow: checkActivated
                      ? `0 12px 30px ${hexToRgba(palette.successColor, 0.18)}`
                      : "0 10px 24px rgba(0, 0, 0, 0.24)",
                    boxSizing: "border-box",
                    opacity: rowOpacity,
                    transform: `translateY(${rowTranslateY}px)`,
                  }}
                >
                  <div
                    style={{
                      width: isPortrait ? 56 : 54,
                      height: isPortrait ? 56 : 54,
                      borderRadius: 16,
                      flexShrink: 0,
                      backgroundColor: palette.successColor,
                      boxShadow: `0 8px 20px ${hexToRgba(palette.successColor, 0.38)}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transform: `scale(${checkScale})`,
                    }}
                  >
                    <Check
                      size={isPortrait ? 32 : 30}
                      color="#FFFFFF"
                      strokeWidth={3.2}
                    />
                  </div>

                  <p
                    style={{
                      margin: 0,
                      fontFamily,
                      fontSize: itemFit.fontSize,
                      fontWeight: 600,
                      lineHeight: 1.32,
                      color: palette.textPrimary,
                      flex: 1,
                    }}
                  >
                    {itemText}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
