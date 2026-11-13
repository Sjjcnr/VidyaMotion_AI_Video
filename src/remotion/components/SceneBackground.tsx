import React, { useId, useMemo } from "react";
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";
import { hexToRgba, type ThemePalette } from "../utils/themeStyles";

export interface SceneBackgroundProps {
  palette: ThemePalette;
  seedPrefix?: string;
  particleCount?: number;
  variant?: "hero" | "split" | "metric" | "flow" | "summary";
}

interface ParticleSpec {
  id: number;
  baseX: number;
  baseY: number;
  size: number;
  speedY: number;
  driftAmpX: number;
  driftFreq: number;
  phase: number;
  baseOpacity: number;
  useAccent: boolean;
}

/**
 * Extracts RGB channels from hex or rgba/rgb CSS color strings so radial glows
 * fade to matching RGB with alpha=0 (preventing gray/black edge fringing on light themes).
 */
function toTransparentFadeColor(color: string): string {
  const trimmed = color.trim();
  if (trimmed.startsWith("#")) {
    return hexToRgba(trimmed, 0);
  }
  const rgbMatch = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i.exec(trimmed);
  if (rgbMatch) {
    return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, 0)`;
  }
  return "rgba(0, 0, 0, 0)";
}

/**
 * Ambient radial glow + subtle geometric grid + frame-driven floating particles.
 * Strictly avoids off-center `radial-gradient(at ...)`, `filter: blur()`, and CSS `@keyframes`
 * so @remotion/web-renderer canvas output matches @remotion/player identically.
 */
export const SceneBackground: React.FC<SceneBackgroundProps> = ({
  palette,
  seedPrefix = "scene",
  particleCount = 18,
  variant = "hero",
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const rawId = useId();
  const gridPatternId = `grid-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const isPortrait = height > width;
  const t = frame / Math.max(1, fps);

  const particles = useMemo<ParticleSpec[]>(() => {
    return Array.from({ length: particleCount }, (_, index) => {
      const seedBase = `${seedPrefix}-particle-${index}`;
      return {
        id: index,
        baseX: random(`${seedBase}-x`),
        baseY: random(`${seedBase}-y`),
        size: 4 + random(`${seedBase}-size`) * 7,
        speedY: 0.018 + random(`${seedBase}-sy`) * 0.032,
        driftAmpX: 12 + random(`${seedBase}-dx`) * 26,
        driftFreq: 0.45 + random(`${seedBase}-df`) * 0.85,
        phase: random(`${seedBase}-ph`) * Math.PI * 2,
        baseOpacity: 0.35 + random(`${seedBase}-op`) * 0.45,
        useAccent: random(`${seedBase}-col`) > 0.55,
      };
    });
  }, [particleCount, seedPrefix]);

  const primaryDiameter = isPortrait
    ? Math.round(width * 1.05)
    : Math.round(height * 0.96);
  const secondaryDiameter = isPortrait
    ? Math.round(width * 0.9)
    : Math.round(height * 0.82);

  const driftX1 = Math.sin(t * 0.45) * 28;
  const driftY1 = Math.cos(t * 0.35) * 22;
  const driftX2 = Math.cos(t * 0.4) * 24;
  const driftY2 = Math.sin(t * 0.32) * 24;

  const primaryCenter =
    variant === "metric"
      ? { x: width * 0.5, y: height * 0.46 }
      : variant === "split"
        ? { x: width * (isPortrait ? 0.5 : 0.26), y: height * (isPortrait ? 0.28 : 0.46) }
        : { x: width * 0.22, y: height * 0.24 };

  const secondaryCenter =
    variant === "metric"
      ? { x: width * 0.5, y: height * 0.54 }
      : { x: width * 0.8, y: height * 0.74 };

  const primaryFade = toTransparentFadeColor(palette.glowPrimary);
  const secondaryFade = toTransparentFadeColor(palette.glowSecondary);
  const accentFade = hexToRgba(palette.accent, 0);

  const gridStep = isPortrait ? 90 : 96;
  const gridOpacity = palette.isDark ? 0.08 : 0.06;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: palette.background,
        backgroundImage: palette.backgroundGradient,
        overflow: "hidden",
      }}
    >
      {/* Subtle geometric grid via cached inline SVG */}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          opacity: gridOpacity,
          pointerEvents: "none",
        }}
      >
        <defs>
          <pattern
            id={gridPatternId}
            width={gridStep}
            height={gridStep}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${gridStep} 0 L 0 0 0 ${gridStep}`}
              fill="none"
              stroke={palette.textMuted}
              strokeWidth={1}
            />
          </pattern>
        </defs>
        <rect width={width} height={height} fill={`url(#${gridPatternId})`} />
      </svg>

      {/* Primary centered ambient radial glow positioned cleanly inside container */}
      <div
        style={{
          position: "absolute",
          width: primaryDiameter,
          height: primaryDiameter,
          left: primaryCenter.x - primaryDiameter / 2 + driftX1,
          top: primaryCenter.y - primaryDiameter / 2 + driftY1,
          borderRadius: 9999,
          backgroundImage: `radial-gradient(circle, ${palette.glowPrimary} 0%, ${hexToRgba(palette.accent, 0.14)} 34%, ${primaryFade} 68%)`,
          pointerEvents: "none",
        }}
      />

      {/* Secondary centered ambient radial glow */}
      <div
        style={{
          position: "absolute",
          width: secondaryDiameter,
          height: secondaryDiameter,
          left: secondaryCenter.x - secondaryDiameter / 2 + driftX2,
          top: secondaryCenter.y - secondaryDiameter / 2 + driftY2,
          borderRadius: 9999,
          backgroundImage: `radial-gradient(circle, ${palette.glowSecondary} 0%, ${hexToRgba(palette.accentSecondary, 0.12)} 34%, ${secondaryFade} 68%)`,
          pointerEvents: "none",
        }}
      />

      {/* Subtle accent halo for hero & metric focus */}
      {(variant === "hero" || variant === "metric") && (
        <div
          style={{
            position: "absolute",
            width: Math.round(primaryDiameter * 0.72),
            height: Math.round(primaryDiameter * 0.72),
            left: width * 0.5 - Math.round(primaryDiameter * 0.72) / 2,
            top: height * (isPortrait ? 0.42 : 0.44) - Math.round(primaryDiameter * 0.72) / 2,
            borderRadius: 9999,
            backgroundImage: `radial-gradient(circle, ${hexToRgba(palette.accent, 0.18)} 0%, ${accentFade} 68%)`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Deterministic frame-driven floating particles */}
      {particles.map((particle) => {
        const yProgress = (particle.baseY - t * particle.speedY + 10) % 1;
        const normalizedY = yProgress < 0 ? yProgress + 1 : yProgress;
        const edgeFade =
          normalizedY < 0.08
            ? normalizedY / 0.08
            : normalizedY > 0.92
              ? (1 - normalizedY) / 0.08
              : 1;
        const pulse = 0.72 + 0.28 * Math.sin(t * 2.1 + particle.phase);
        const xPos =
          particle.baseX * width +
          Math.sin(t * particle.driftFreq + particle.phase) * particle.driftAmpX;
        const yPos = normalizedY * height;
        const color = particle.useAccent ? palette.accent : palette.particleColor;

        return (
          <div
            key={particle.id}
            style={{
              position: "absolute",
              left: xPos,
              top: yPos,
              width: particle.size,
              height: particle.size,
              borderRadius: 9999,
              backgroundColor: color,
              opacity: particle.baseOpacity * edgeFade * pulse,
              boxShadow: `0 0 12px ${palette.accentGlow}`,
              pointerEvents: "none",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
