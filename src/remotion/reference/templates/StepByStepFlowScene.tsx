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

interface ParsedStep {
  label: string;
  body: string;
}

function parseStepText(raw: string): ParsedStep {
  const clean = clampText(raw, 100);
  const colonIdx = clean.indexOf(":");
  if (colonIdx > 0 && colonIdx <= 28) {
    const label = clean.slice(0, colonIdx).trim();
    const body = clean.slice(colonIdx + 1).trim();
    if (label.length > 0 && body.length > 0) {
      return { label, body };
    }
  }
  return { label: "", body: clean };
}

export const StepByStepFlowScene: React.FC<SceneComponentProps> = ({
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

  const rawSteps = (scene.bulletPoints ?? [])
    .map((b) => b.trim())
    .filter((b) => b.length > 0)
    .slice(0, 4);

  const steps =
    rawSteps.length > 0
      ? rawSteps
      : [scene.subtext?.trim() || scene.heading.trim()];

  const padX = isPortrait ? 64 : 88;
  const padTop = isPortrait ? 100 : 74;
  const padBottom = isPortrait ? 290 : 196;
  const usableWidth = width - padX * 2;
  const usableHeight = height - padTop - padBottom;

  const headingText = clampText(scene.heading, 80);
  const headingFit = computeFittedMultilineText({
    text: headingText,
    maxLines: 2,
    maxBoxWidth: usableWidth - 110,
    fontFamily,
    fontWeight: 800,
    maxFontSize: isPortrait ? 54 : 56,
    minFontSize: 30,
  });

  const subtextText = scene.subtext ? clampText(scene.subtext, 160) : "";
  const subtextFit =
    subtextText && rawSteps.length > 0
      ? computeFittedMultilineText({
          text: subtextText,
          maxLines: 2,
          maxBoxWidth: usableWidth - 80,
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

  const stepCount = steps.length;
  const connectorCount = Math.max(0, stepCount - 1);

  const connectorWidth = isPortrait ? 48 : stepCount >= 4 ? 54 : 74;
  const connectorHeight = isPortrait ? (stepCount >= 4 ? 46 : 62) : 48;
  const cardGap = isPortrait ? 10 : 12;

  const cardWidth = isPortrait
    ? usableWidth
    : Math.min(
        560,
        Math.floor(
          (usableWidth - connectorCount * (connectorWidth + cardGap * 2)) /
            stepCount
        )
      );

  const availableColumnHeight = usableHeight - (subtextFit ? 235 : 170);
  const cardHeight = isPortrait
    ? Math.min(
        340,
        Math.floor(
          (availableColumnHeight - connectorCount * (connectorHeight + cardGap * 2)) /
            stepCount
        )
      )
    : Math.min(470, usableHeight - 170);

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <SceneBackground
        palette={palette}
        seedPrefix={`flow-${scene.id}`}
        particleCount={14}
        variant="flow"
      />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: padTop,
          paddingBottom: padBottom,
          paddingLeft: padX,
          paddingRight: padX,
          boxSizing: "border-box",
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
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 18,
            }}
          >
            <div
              style={{
                width: isPortrait ? 64 : 62,
                height: isPortrait ? 64 : 62,
                borderRadius: 18,
                backgroundColor: palette.accentSoft,
                border: `1.5px solid ${hexToRgba(palette.accent, 0.45)}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
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
                fontWeight: 800,
                lineHeight: 1.18,
                color: palette.textPrimary,
              }}
            >
              {headingText}
            </h2>
          </div>

          {subtextFit && (
            <p
              style={{
                margin: "12px 0 0 0",
                fontFamily,
                fontSize: subtextFit.fontSize,
                fontWeight: 500,
                lineHeight: 1.35,
                color: palette.textSecondary,
                maxWidth: usableWidth - 80,
              }}
            >
              {subtextText}
            </p>
          )}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: isPortrait ? "column" : "row",
            alignItems: "center",
            justifyContent: "center",
            gap: cardGap,
            width: "100%",
            flex: 1,
          }}
        >
          {steps.map((rawStep, index) => {
            const parsed = parseStepText(rawStep);
            const cardDelay = index * 18;
            const delayedFrame = Math.max(0, frame - cardDelay);
            const cardSpring = spring({
              frame: delayedFrame,
              fps: 30,
              config: { damping: 13, mass: 0.8 },
            });
            const cardOpacity = interpolate(delayedFrame, [0, 12], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const cardScale = interpolate(cardSpring, [0, 1], [0.88, 1]);

            const innerBoxWidth = isPortrait
              ? cardWidth - 150
              : cardWidth - 56;
            const labelFontSize = parsed.label
              ? computeFittedFontSize({
                  text: parsed.label,
                  withinWidth: innerBoxWidth,
                  fontFamily,
                  fontWeight: 800,
                  maxFontSize: isPortrait ? 30 : 28,
                  minFontSize: 20,
                })
              : 0;

            const bodyFit = computeFittedMultilineText({
              text: parsed.body,
              maxLines: isPortrait ? 2 : 4,
              maxBoxWidth: innerBoxWidth,
              fontFamily,
              fontWeight: 600,
              maxFontSize: stepCount >= 4 ? (isPortrait ? 26 : 25) : (isPortrait ? 30 : 28),
              minFontSize: 18,
            });

            const hasConnector = index < stepCount - 1;
            const lineStartFrame = cardDelay + 8;
            const lineProgress = interpolate(
              frame,
              [lineStartFrame, lineStartFrame + 18],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            const arrowOpacity = interpolate(
              frame,
              [lineStartFrame + 12, lineStartFrame + 18],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );

            const hLineLen = connectorWidth - 14;
            const vLineLen = connectorHeight - 14;

            return (
              <React.Fragment key={`${index}-${parsed.body.slice(0, 12)}`}>
                <div
                  style={{
                    width: cardWidth,
                    height: cardHeight,
                    flexShrink: 0,
                    borderRadius: 26,
                    backgroundColor: palette.surface,
                    border: `1.5px solid ${palette.border}`,
                    boxShadow: `0 16px 38px ${hexToRgba(palette.accent, 0.2)}`,
                    padding: isPortrait ? "20px 28px" : "28px 28px",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: isPortrait ? "row" : "column",
                    alignItems: isPortrait ? "center" : "flex-start",
                    justifyContent: isPortrait ? "flex-start" : "space-between",
                    gap: isPortrait ? 24 : 18,
                    opacity: cardOpacity,
                    transform: `scale(${cardScale})`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "row",
                      gap: 10,
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        width: isPortrait ? 64 : 58,
                        height: isPortrait ? 64 : 58,
                        borderRadius: 18,
                        backgroundColor: palette.accentSoft,
                        border: `2px solid ${palette.accent}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily,
                        fontSize: isPortrait ? 26 : 24,
                        fontWeight: 800,
                        color: palette.accent,
                      }}
                    >
                      {`0${index + 1}`}
                    </div>

                    {!isPortrait && (
                      <span
                        style={{
                          fontFamily,
                          fontSize: 18,
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                          color: palette.textMuted,
                        }}
                      >
                        {`STEP ${index + 1}`}
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      gap: 8,
                      flex: 1,
                    }}
                  >
                    {parsed.label ? (
                      <div
                        style={{
                          fontFamily,
                          fontSize: labelFontSize,
                          fontWeight: 800,
                          lineHeight: 1.2,
                          color: palette.accent,
                        }}
                      >
                        {parsed.label}
                      </div>
                    ) : null}

                    <p
                      style={{
                        margin: 0,
                        fontFamily,
                        fontSize: bodyFit.fontSize,
                        fontWeight: 600,
                        lineHeight: 1.35,
                        color: palette.textPrimary,
                      }}
                    >
                      {parsed.body}
                    </p>
                  </div>
                </div>

                {hasConnector && (
                  <svg
                    width={connectorWidth}
                    height={connectorHeight}
                    viewBox={`0 0 ${connectorWidth} ${connectorHeight}`}
                    style={{ flexShrink: 0, display: "block" }}
                  >
                    {isPortrait ? (
                      <>
                        <line
                          x1={connectorWidth / 2}
                          y1={4}
                          x2={connectorWidth / 2}
                          y2={connectorHeight - 10}
                          stroke={palette.border}
                          strokeWidth={4}
                          strokeLinecap="round"
                        />
                        <line
                          x1={connectorWidth / 2}
                          y1={4}
                          x2={connectorWidth / 2}
                          y2={connectorHeight - 10}
                          stroke={palette.accent}
                          strokeWidth={4}
                          strokeLinecap="round"
                          strokeDasharray={vLineLen}
                          strokeDashoffset={vLineLen * (1 - lineProgress)}
                        />
                        <polyline
                          points={`${connectorWidth / 2 - 9},${connectorHeight - 18} ${connectorWidth / 2},${connectorHeight - 6} ${connectorWidth / 2 + 9},${connectorHeight - 18}`}
                          fill="none"
                          stroke={palette.accent}
                          strokeWidth={4}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          opacity={arrowOpacity}
                        />
                      </>
                    ) : (
                      <>
                        <line
                          x1={4}
                          y1={connectorHeight / 2}
                          x2={connectorWidth - 10}
                          y2={connectorHeight / 2}
                          stroke={palette.border}
                          strokeWidth={4}
                          strokeLinecap="round"
                        />
                        <line
                          x1={4}
                          y1={connectorHeight / 2}
                          x2={connectorWidth - 10}
                          y2={connectorHeight / 2}
                          stroke={palette.accent}
                          strokeWidth={4}
                          strokeLinecap="round"
                          strokeDasharray={hLineLen}
                          strokeDashoffset={hLineLen * (1 - lineProgress)}
                        />
                        <polyline
                          points={`${connectorWidth - 18},${connectorHeight / 2 - 9} ${connectorWidth - 6},${connectorHeight / 2} ${connectorWidth - 18},${connectorHeight / 2 + 9}`}
                          fill="none"
                          stroke={palette.accent}
                          strokeWidth={4}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          opacity={arrowOpacity}
                        />
                      </>
                    )}
                  </svg>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
