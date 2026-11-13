import * as LucideIcons from "lucide-react";
import React, { Component, useMemo, type ErrorInfo, type ReactNode } from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { transform } from "sucrase";
import type { Scene, VideoProject } from "../types";
import { type ThemePalette } from "../utils/themeStyles";
import { SceneBackground } from "./SceneBackground";

interface DynamicSceneRunnerProps {
  scene: Scene;
  palette: ThemePalette;
  fontFamily: string;
  project: VideoProject;
  isPortrait: boolean;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: (error: Error) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class SceneErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn("[DynamicSceneRunner] Runtime error caught in scene code:", error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback(this.state.error);
    }
    return this.props.children;
  }
}

/**
 * Static security and infinite loop validator.
 * Throws an Error if forbidden APIs or unbounded loops are detected.
 */
export function validateSceneCode(code: string): void {
  if (!code || typeof code !== "string" || code.trim().length === 0) {
    throw new Error("Scene code is empty.");
  }

  const forbiddenPatterns: Array<{ pattern: RegExp; reason: string }> = [
    { pattern: /\bwindow\.location\b/, reason: "window.location access is forbidden" },
    { pattern: /\bdocument\.cookie\b/, reason: "document.cookie access is forbidden" },
    { pattern: /\blocalStorage\b/, reason: "localStorage access is forbidden" },
    { pattern: /\bsessionStorage\b/, reason: "sessionStorage access is forbidden" },
    { pattern: /\bfetch\s*\(/, reason: "Network fetch() is forbidden" },
    { pattern: /\bXMLHttpRequest\b/, reason: "XMLHttpRequest is forbidden" },
    { pattern: /\bWebSocket\b/, reason: "WebSocket is forbidden" },
    { pattern: /\beval\s*\(/, reason: "eval() execution is forbidden" },
    { pattern: /\bnew\s+Function\s*\(/, reason: "Function constructor is forbidden" },
    { pattern: /\bprocess\.env\b/, reason: "process.env access is forbidden" },
    { pattern: /\bimport\s+[\s\S]*?from/, reason: "Dynamic imports are forbidden" },
    // Infinite loop guards
    { pattern: /\bwhile\s*\(/, reason: "while loops are forbidden; use frame-based interpolate()" },
    { pattern: /\bdo\s*\{/, reason: "do-while loops are forbidden" },
    { pattern: /\bfor\s*\([^;]*;\s*;\s*[^)]*\)/, reason: "Unbounded for-loops are forbidden" },
    { pattern: /\bsetInterval\s*\(/, reason: "setInterval is forbidden; use Remotion frame clock" },
    { pattern: /\bsetTimeout\s*\(/, reason: "setTimeout is forbidden; use Remotion frame clock" },
    { pattern: /\brequestAnimationFrame\s*\(/, reason: "requestAnimationFrame is forbidden" },
  ];

  for (const { pattern, reason } of forbiddenPatterns) {
    if (pattern.test(code)) {
      throw new Error(`Security validation failed: ${reason}`);
    }
  }
}

/**
 * Placeholder Scene Card rendered when code generation falls back or fails.
 * Guarantees zero player crashes and allows audio and captions to continue playing seamlessly.
 */
export const PlaceholderSceneCard: React.FC<{
  scene: Scene;
  palette: ThemePalette;
  fontFamily: string;
  isPortrait: boolean;
  errorMessage?: string;
}> = ({ scene, palette, fontFamily, isPortrait, errorMessage }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.8 },
  });

  const accentColor = scene.accentColor || palette.accent;

  return (
    <AbsoluteFill
      style={{
        fontFamily,
        backgroundColor: palette.background,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: isPortrait ? "40px 24px 180px" : "60px 80px 180px",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <SceneBackground palette={palette} seedPrefix={scene.id} />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: isPortrait ? "100%" : "960px",
          width: "100%",
          backgroundColor: palette.surface,
          border: `1px solid ${palette.border}`,
          borderRadius: "24px",
          padding: isPortrait ? "36px 24px" : "48px 56px",
          boxSizing: "border-box",
          boxShadow: `0 12px 32px rgba(0,0,0,0.5)`,
          transform: `scale(${entrance})`,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Accent Glow Pill */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 16px",
            borderRadius: "999px",
            backgroundColor: `${accentColor}22`,
            border: `1px solid ${accentColor}66`,
            color: accentColor,
            fontSize: isPortrait ? "16px" : "18px",
            fontWeight: 700,
            marginBottom: "20px",
          }}
        >
          <LucideIcons.Sparkles size={isPortrait ? 18 : 20} color={accentColor} />
          <span>{scene.modelUsed ? `AI Generated (${scene.modelUsed})` : "Educational Visual"}</span>
        </div>

        {/* Scene Heading */}
        <h1
          style={{
            fontSize: isPortrait ? "36px" : "52px",
            fontWeight: 800,
            color: palette.textPrimary,
            margin: "0 0 16px 0",
            lineHeight: 1.15,
          }}
        >
          {scene.heading}
        </h1>

        {/* Subtext */}
        {scene.subtext && (
          <p
            style={{
              fontSize: isPortrait ? "20px" : "24px",
              color: palette.textSecondary,
              margin: "0 0 24px 0",
              lineHeight: 1.45,
              maxWidth: "800px",
            }}
          >
            {scene.subtext}
          </p>
        )}

        {/* Visual Brief Notice */}
        {scene.visualBrief && (
          <div
            style={{
              padding: "16px 24px",
              borderRadius: "16px",
              backgroundColor: "rgba(0,0,0,0.3)",
              border: `1px dashed ${accentColor}44`,
              color: palette.textSecondary,
              fontSize: isPortrait ? "16px" : "18px",
              lineHeight: 1.4,
              fontStyle: "italic",
            }}
          >
            Concept: {scene.visualBrief}
          </div>
        )}

        {errorMessage && (
          <span
            style={{
              marginTop: "16px",
              fontSize: "13px",
              color: "rgba(248, 113, 113, 0.8)",
              fontFamily: "monospace",
            }}
          >
            [Fallback card active: {errorMessage.slice(0, 80)}]
          </span>
        )}
      </div>
    </AbsoluteFill>
  );
};

export const DynamicSceneRunner: React.FC<DynamicSceneRunnerProps> = ({
  scene,
  palette,
  fontFamily,
  project: _project,
  isPortrait,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // In-browser Sucrase compilation and evaluation
  const { Component: ExecutableComponent, compileError } = useMemo(() => {
    if (scene.isPlaceholder || !scene.code || scene.code.trim().length === 0) {
      return { Component: null, compileError: null };
    }

    try {
      validateSceneCode(scene.code);

      const transformed = transform(scene.code, {
        transforms: ["jsx", "typescript", "imports"],
        jsxRuntime: "classic",
      }).code;

      const exportsObj: { default?: React.ComponentType<any>; [key: string]: any } = {};

      const RemotionScope = {
        useCurrentFrame: () => {
          try {
            return useCurrentFrame();
          } catch {
            return 0;
          }
        },
        useVideoConfig: () => {
          try {
            return useVideoConfig();
          } catch {
            return {
              fps: 30,
              width: isPortrait ? 1080 : 1920,
              height: isPortrait ? 1920 : 1080,
              durationInFrames: scene.durationInFrames || 150,
            };
          }
        },
        interpolate,
        spring,
        AbsoluteFill,
        Sequence,
      };

      // Create sandboxed execution factory with shadowed globals
      const factory = new Function(
        "exports",
        "React",
        "Remotion",
        "Lucide",
        "palette",
        "accentColor",
        "isPortrait",
        "frame",
        "fps",
        "durationInFrames",
        "heading",
        "subtext",
        "narrationScript",
        "window",
        "document",
        "globalThis",
        "fetch",
        "localStorage",
        "sessionStorage",
        transformed
      );

      const factoryResult = factory(
        exportsObj,
        React,
        RemotionScope,
        LucideIcons,
        palette,
        scene.accentColor || palette.accent,
        isPortrait,
        frame,
        fps,
        scene.durationInFrames || 150,
        scene.heading,
        scene.subtext || "",
        scene.narrationScript,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      );

      const SceneFn =
        exportsObj.default ||
        exportsObj.GeneratedScene ||
        exportsObj.Scene ||
        (typeof factoryResult === "function" ? factoryResult : undefined) ||
        Object.values(exportsObj).find((v) => typeof v === "function");

      if (!SceneFn || typeof SceneFn !== "function") {
        throw new Error("Compiled code did not export a valid React component.");
      }

      return { Component: SceneFn, compileError: null };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { Component: null, compileError: msg };
    }
  }, [scene.code, scene.isPlaceholder]);

  // If compilation failed or marked as placeholder, render placeholder card
  if (compileError || !ExecutableComponent) {
    return (
      <PlaceholderSceneCard
        scene={scene}
        palette={palette}
        fontFamily={fontFamily}
        isPortrait={isPortrait}
        errorMessage={compileError ?? undefined}
      />
    );
  }

  // Render compiled component wrapped in ErrorBoundary
  return (
    <SceneErrorBoundary
      fallback={(runtimeError) => (
        <PlaceholderSceneCard
          scene={scene}
          palette={palette}
          fontFamily={fontFamily}
          isPortrait={isPortrait}
          errorMessage={`Runtime: ${runtimeError.message}`}
        />
      )}
    >
      <AbsoluteFill
        style={{
          fontFamily,
          backgroundColor: palette.background,
          overflow: "hidden",
        }}
      >
        <style>{`
          svg text, svg tspan {
            font-family: ${fontFamily}, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          }
        `}</style>
        <SceneBackground palette={palette} seedPrefix={scene.id} />
        <ExecutableComponent
          frame={frame}
          fps={fps}
          durationInFrames={scene.durationInFrames || 150}
          palette={palette}
          accentColor={scene.accentColor || palette.accent}
          isPortrait={isPortrait}
          heading={scene.heading}
          subtext={scene.subtext}
          narrationScript={scene.narrationScript}
        />
      </AbsoluteFill>
    </SceneErrorBoundary>
  );
};
