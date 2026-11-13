import type {
  GenerateSceneCodeRequest,
  ThemeId,
} from "../types.ts";
import { THEME_PALETTES, type ThemePalette } from "../utils/themeStyles.ts";

/**
 * Canvas dimension and safe margin definitions for both aspect ratios.
 * Exported to ensure exact parity between UI, Code Generator, and Renderer.
 */
export const CANVAS_SAFE_ZONES = {
  "16:9": {
    width: 1920,
    height: 1080,
    aspectRatio: "16:9",
    paddingX: 96,
    paddingTop: 72,
    paddingBottom: 200, // Safe clearance for bottom Karaoke Captions
    usableWidth: 1728,
    usableHeight: 808,
    maxHeadingFontSize: 64,
    minHeadingFontSize: 32,
    maxBodyFontSize: 30,
    minBodyFontSize: 18,
  },
  "9:16": {
    width: 1080,
    height: 1920,
    aspectRatio: "9:16",
    paddingX: 64,
    paddingTop: 100,
    paddingBottom: 300, // Extra vertical clearance for stacked portrait captions
    usableWidth: 952,
    usableHeight: 1520,
    maxHeadingFontSize: 56,
    minHeadingFontSize: 28,
    maxBodyFontSize: 28,
    minBodyFontSize: 18,
  },
} as const;

/**
 * Pre-defined Theme Token Color Maps for all 4 supported themes.
 * Uses pure #hex and rgba() colors (zero oklch() / CSS variables).
 */
export const THEME_TOKEN_COLOR_MAPS: Record<ThemeId, ThemePalette> = THEME_PALETTES;
export const THEME_COLOR_TOKENS = THEME_TOKEN_COLOR_MAPS;

/**
 * Core Animation Principles & Snippets for Remotion TSX generation.
 */
export const ANIMATION_PRINCIPLES = {
  springScaleEntrance: `
// Scale pop entrance (0.85 -> 1.0)
const enterSpring = spring({
  frame,
  fps: 30,
  config: { damping: 13, mass: 0.8 },
});
const scale = interpolate(enterSpring, [0, 1], [0.85, 1]);
const opacity = interpolate(frame, [0, 16], [0, 1], { extrapolateRight: "clamp" });
`,
  staggeredElements: `
// Stagger element entrance based on index
const delay = index * 15;
const elemFrame = Math.max(0, frame - delay);
const elemSpring = spring({
  frame: elemFrame,
  fps: 30,
  config: { damping: 14, mass: 0.8 },
});
const translateY = interpolate(elemSpring, [0, 1], [24, 0]);
const elemOpacity = interpolate(elemFrame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
`,
  floatingIdle: `
// Gentle floating loop for diagrams/icons (period = 60 frames = 2 seconds)
const floatY = Math.sin((frame / 30) * Math.PI) * 8;
const floatRotate = Math.sin((frame / 45) * Math.PI) * 2;
`,
  svgPathDraw: `
// SVG stroke draw-in animation
const pathLength = 500; // estimated or exact stroke length
const drawProgress = interpolate(frame, [10, 40], [0, 1], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
const strokeDashoffset = pathLength * (1 - drawProgress);
// Apply to SVG: strokeDasharray={pathLength} strokeDashoffset={strokeDashoffset}
`,
  numericCountUp: `
// Numeric stat count-up (0 -> target over 30 frames)
const countValue = interpolate(frame, [0, 30], [0, targetValue], {
  extrapolateRight: "clamp",
});
const displayNum = countValue.toFixed(decimals);
`,
} as const;

/**
 * Few-shot TSX exemplars for Stage 2 Code Generation.
 * These show the LLM how to write self-contained, crash-proof, web-renderer compatible Remotion TSX code.
 */
export const FEW_SHOT_SCENE_EXCERPTS = [
  {
    title: "Animated SVG Technical Flowchart & State Machine",
    description: "Deep, multi-element technical flow with animated SVG paths, moving charges, state counters, and full vertical portrait support.",
    code: `export default function GeneratedScene(props) {
  const { frame, fps, durationInFrames, isPortrait } = props;
  const { AbsoluteFill, spring, interpolate } = Remotion;
  const { Zap, Activity, Cpu, ArrowRight } = Lucide;
  const tokens = props.tokens ?? props.palette;

  const intro = spring({ frame, fps: 30, config: { damping: 14 } });
  const cycle = (frame % 60) / 60;
  const pulse = Math.sin(frame * 0.1) * 4;

  const padX = isPortrait ? 48 : 80;
  const padBottom = isPortrait ? 300 : 200;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: \`60px \${padX}px \${padBottom}px \${padX}px\`,
        boxSizing: "border-box",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Top Header */}
      <div style={{ textAlign: "center", marginBottom: isPortrait ? 24 : 16 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 16px",
            borderRadius: 999,
            backgroundColor: tokens.accent + "22",
            border: "1px solid " + tokens.accent + "66",
            color: tokens.accent,
            fontSize: isPortrait ? 18 : 16,
            fontWeight: 700,
            marginBottom: 12,
          }}
        >
          <Zap size={isPortrait ? 20 : 18} color={tokens.accent} />
          <span>ALGORITHMIC EXECUTION PIPELINE</span>
        </div>
        <h2 style={{ fontSize: isPortrait ? 44 : 52, fontWeight: 800, color: tokens.textPrimary, margin: "0 0 8px 0" }}>
          {props.heading ?? props.scene?.heading}
        </h2>
        {(props.subtext ?? props.scene?.subtext) && (
          <p style={{ fontSize: isPortrait ? 22 : 24, color: tokens.textSecondary, margin: 0 }}>
            {props.subtext ?? props.scene?.subtext}
          </p>
        )}
      </div>

      {/* Central Large Technical Visual Canvas - Vertically Expanded in Portrait */}
      <div
        style={{
          flex: 1,
          width: "100%",
          maxHeight: isPortrait ? 1050 : 540,
          backgroundColor: tokens.surface,
          border: "1.5px solid " + tokens.border,
          borderRadius: 28,
          padding: isPortrait ? "32px 20px" : "28px 40px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transform: \`scale(\${intro})\`,
          boxShadow: "0 16px 40px rgba(0, 0, 0, 0.35)",
        }}
      >
        <svg
          viewBox={isPortrait ? "0 0 800 1000" : "0 0 1000 480"}
          style={{ width: "100%", height: "100%" }}
        >
          <defs>
            <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={tokens.accent} />
              <stop offset="100%" stopColor={tokens.accentSecondary} />
            </linearGradient>
          </defs>

          {/* Node 1: Ingestion */}
          <rect x={isPortrait ? 150 : 60} y={isPortrait ? 80 : 160} width={isPortrait ? 500 : 220} height={isPortrait ? 120 : 140} rx={18} fill={tokens.surfaceElevated} stroke={tokens.accent} strokeWidth={2.5} />
          <text x={isPortrait ? 400 : 170} y={isPortrait ? 135 : 220} fill={tokens.textPrimary} fontSize={20} fontWeight="bold" textAnchor="middle">01. INGESTION</text>
          <text x={isPortrait ? 400 : 170} y={isPortrait ? 165 : 255} fill={tokens.textSecondary} fontSize={15} textAnchor="middle">Raw Data Stream Parsed</text>

          {/* Dynamic Animated Pulse Line between 1 and 2 */}
          <path
            d={isPortrait ? "M 400 200 L 400 340" : "M 280 230 L 380 230"}
            fill="none"
            stroke={tokens.accent}
            strokeWidth={3.5}
            strokeDasharray="8 6"
          />
          <circle
            cx={isPortrait ? 400 : 280 + cycle * 100}
            cy={isPortrait ? 200 + cycle * 140 : 230}
            r={7 + pulse * 0.4}
            fill="#FDE047"
          />

          {/* Node 2: Transform / Pivot */}
          <rect x={isPortrait ? 150 : 380} y={isPortrait ? 340 : 160} width={isPortrait ? 500 : 240} height={isPortrait ? 120 : 140} rx={18} fill={tokens.surfaceElevated} stroke={tokens.accentSecondary} strokeWidth={2.5} />
          <text x={isPortrait ? 400 : 500} y={isPortrait ? 395 : 220} fill={tokens.textPrimary} fontSize={20} fontWeight="bold" textAnchor="middle">02. PARTITION & PIVOT</text>
          <text x={isPortrait ? 400 : 500} y={isPortrait ? 425 : 255} fill={tokens.textSecondary} fontSize={15} textAnchor="middle">O(log n) Space Pruned</text>

          {/* Dynamic Animated Pulse Line between 2 and 3 */}
          <path
            d={isPortrait ? "M 400 460 L 400 600" : "M 620 230 L 720 230"}
            fill="none"
            stroke={tokens.accentSecondary}
            strokeWidth={3.5}
            strokeDasharray="8 6"
          />
          <circle
            cx={isPortrait ? 400 : 620 + cycle * 100}
            cy={isPortrait ? 460 + cycle * 140 : 230}
            r={7 + pulse * 0.4}
            fill="#38BDF8"
          />

          {/* Node 3: Result Synthesis */}
          <rect x={isPortrait ? 150 : 720} y={isPortrait ? 600 : 160} width={isPortrait ? 500 : 220} height={isPortrait ? 120 : 140} rx={18} fill={tokens.surfaceElevated} stroke={tokens.successColor} strokeWidth={2.5} />
          <text x={isPortrait ? 400 : 830} y={isPortrait ? 655 : 220} fill={tokens.textPrimary} fontSize={20} fontWeight="bold" textAnchor="middle">03. CONVERGENCE</text>
          <text x={isPortrait ? 400 : 830} y={isPortrait ? 685 : 255} fill={tokens.textSecondary} fontSize={15} textAnchor="middle">Deterministic State Verified</text>

          {/* Real-time Math Metric Banner */}
          <rect x={isPortrait ? 100 : 150} y={isPortrait ? 800 : 360} width={isPortrait ? 600 : 700} height={isPortrait ? 90 : 80} rx={16} fill="rgba(0,0,0,0.4)" stroke={tokens.border} strokeWidth={1.5} />
          <text x={isPortrait ? 400 : 500} y={isPortrait ? 852 : 410} fill={tokens.accent} fontSize={18} fontWeight="bold" textAnchor="middle">
            Complexity Invariant: T(n) = 2T(n/2) + O(n) · Guaranteed Convergence
          </text>
        </svg>
      </div>
    </AbsoluteFill>
  );
}`,
  },
  {
    title: "Animated SVG Metric Card with Rotating Gradient Border",
    description: "Numeric stat highlight with animated SVG border and count-up.",
    code: `export default function GeneratedScene(props) {
  const { frame, fps, isPortrait } = props;
  const { AbsoluteFill, spring, interpolate } = Remotion;
  const { Zap, Activity } = Lucide;
  const tokens = props.tokens ?? props.palette;

  const cardW = isPortrait ? 920 : 1280;
  const cardH = isPortrait ? 800 : 540;
  const perimeter = 2 * (cardW + cardH);

  // Rotate stroke offset along SVG border
  const strokeOffset = -((frame * 12) % perimeter);
  const arcLen = perimeter * 0.35;

  const statVal = interpolate(frame, [0, 30], [0, 99.8], { extrapolateRight: "clamp" });
  const enterSpring = spring({ frame, fps: 30, config: { damping: 13, mass: 0.8 } });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: isPortrait ? 280 : 190,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          position: "relative",
          width: cardW,
          height: cardH,
          borderRadius: 32,
          backgroundColor: tokens.surface,
          boxShadow: \`0 24px 60px \${tokens.accentGlow}\`,
          transform: \`scale(\${interpolate(enterSpring, [0, 1], [0.88, 1])})\`,
          opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" }),
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px",
          boxSizing: "border-box",
          textAlign: "center",
        }}
      >
        <svg
          width={cardW}
          height={cardH}
          viewBox={\`0 0 \${cardW} \${cardH}\`}
          style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}
        >
          <defs>
            <linearGradient id="metric-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={tokens.accent} />
              <stop offset="100%" stopColor={tokens.accentSecondary} />
            </linearGradient>
          </defs>
          <rect x={4} y={4} width={cardW - 8} height={cardH - 8} rx={28} ry={28} fill="none" stroke={tokens.border} strokeWidth={2} />
          <rect
            x={4}
            y={4}
            width={cardW - 8}
            height={cardH - 8}
            rx={28}
            ry={28}
            fill="none"
            stroke="url(#metric-grad)"
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={\`\${arcLen} \${perimeter - arcLen}\`}
            strokeDashoffset={strokeOffset}
          />
        </svg>

        <h2 style={{ fontSize: isPortrait ? 40 : 44, fontWeight: 700, color: tokens.textSecondary, margin: "0 0 20px 0" }}>
          {props.heading ?? props.scene?.heading}
        </h2>

        <div style={{ fontSize: isPortrait ? 96 : 110, fontWeight: 800, color: tokens.accent, lineHeight: 1.1 }}>
          {statVal.toFixed(1)}%
        </div>

        {(props.subtext ?? props.scene?.subtext) && (
          <p style={{ fontSize: isPortrait ? 26 : 28, color: tokens.textPrimary, margin: "24px 0 0 0", maxWidth: cardW - 120 }}>
            {props.subtext ?? props.scene?.subtext}
          </p>
        )}
      </div>
    </AbsoluteFill>
  );
}`,
  },
  {
    title: "Split Visual Diagram with Concentric Rings",
    description: "50/50 split layout with pulsating animated rings and floating emblem.",
    code: `export default function GeneratedScene(props) {
  const { frame, fps, isPortrait } = props;
  const { AbsoluteFill, spring, interpolate } = Remotion;
  const { Cpu, Check } = Lucide;
  const tokens = props.tokens ?? props.palette;

  const floatY = Math.sin((frame / 30) * Math.PI) * 8;
  const pulseScale = interpolate((frame % 60) / 60, [0, 1], [0.8, 1.3]);
  const pulseOpacity = interpolate((frame % 60) / 60, [0, 0.4, 1], [0, 0.5, 0]);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: isPortrait ? "column" : "row",
        alignItems: "center",
        justifyContent: "center",
        gap: isPortrait ? 32 : 64,
        padding: \`72px \${isPortrait ? 64 : 96}px \${isPortrait ? 290 : 196}px \${isPortrait ? 64 : 96}px\`,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: isPortrait ? "100%" : "44%",
          height: isPortrait ? "36%" : "100%",
          borderRadius: 28,
          backgroundColor: tokens.surface,
          border: \`1.5px solid \${tokens.border}\`,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 220,
            height: 220,
            borderRadius: 9999,
            border: \`2px solid \${tokens.accent}\`,
            transform: \`scale(\${pulseScale})\`,
            opacity: pulseOpacity,
          }}
        />
        <div style={{ transform: \`translateY(\${floatY}px)\` }}>
          <Cpu size={isPortrait ? 88 : 110} color={tokens.accent} strokeWidth={1.8} />
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18 }}>
        <h2 style={{ fontSize: isPortrait ? 48 : 56, fontWeight: 800, color: tokens.textPrimary, margin: 0 }}>
          {props.heading ?? props.scene?.heading}
        </h2>
        {(props.subtext ?? props.scene?.subtext) && (
          <p style={{ fontSize: isPortrait ? 24 : 26, color: tokens.textSecondary, margin: 0 }}>
            {props.subtext ?? props.scene?.subtext}
          </p>
        )}
      </div>
    </AbsoluteFill>
  );
}`,
  },
];

/**
 * Formatted few-shot code examples as a string for injection into Gemini prompts.
 */
export const FEW_SHOT_CODE_EXAMPLES = FEW_SHOT_SCENE_EXCERPTS.map(
  (ex) => `// =======================================
// EXAMPLE: ${ex.title}
// ${ex.description}
// =======================================
${ex.code}`
).join("\n\n");

/**
 * Complete Stage 2 Remotion TSX Code Generation System Prompt.
 * Injected into Gemini API calls to produce clean, safe, compilable Remotion code.
 */
export const STAGE_2_SYSTEM_PROMPT = `
You are the Principal Motion Graphics Engineer and Remotion TSX Specialist for "VidyaMotion AI".
Your task is to write high-fidelity, production-grade, self-contained Remotion TSX scene components tailored to the educational topic and visual brief.

### CRITICAL CORE DIRECTIVES:
1. GENERATE AS LONG CODE AS POSSIBLE (MINIMUM 200 TO 450+ LINES):
   Write deep, detailed, comprehensive animation code. Never output brief or truncated stubs.
   Include rich multi-layered SVG vector geometry, labeled nodes, moving particles, dynamic connection paths, and mathematical formulas.

2. STRICT ZERO-PPT / ANTI-SLIDE POLICY:
   ABSOLUTELY NO PowerPoint-style bullet point cards, slide decks, or text-heavy card lists!
   The voiceover already handles the narration!
   The visual canvas MUST be a programmatic motion graphic — an interactive animated diagram, biological/chemical structure, algorithmic tree/graph simulation, physics schematic, or engineering flow.

3. FULL VERTICAL CANVAS UTILIZATION IN 9:16 PORTRAIT (1080x1920):
   - In portrait mode, the screen height is 1920px!
   - NEVER make a small 360px landscape box that leaves the top and bottom empty!
   - Make the central visual diagram TALL: height: isPortrait ? "950px" : "500px". In portrait, use a tall SVG viewBox (e.g. "0 0 800 1100" or "0 0 900 1200") so the graphic fills the vertical space.
   - Stack vertically: Top header (0-280px), tall central diagram/mechanism (280-1450px), live metrics/formula pill (1450-1650px), karaoke subtitles clearance (1650-1920px).

### RUNTIME EXECUTION ENVIRONMENT
Your code will be compiled in the browser via Sucrase and evaluated inside a sandboxed factory function:
\`const factory = new Function("React", "Remotion", "Lucide", "tokens", "props", code);\`

Injected scope:
1. 'React': React library (createElement, useState, useEffect, useMemo, useRef, Fragment).
2. 'Remotion': Remotion primitives (AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, spring, interpolate, random).
3. 'Lucide': Lucide React icon components (e.g. Lucide.Zap, Lucide.Cpu, Lucide.Sun, Lucide.Atom, Lucide.Brain, Lucide.Check, Lucide.ArrowRight, etc.).
4. 'tokens': Active ThemePalette with pure #hex/rgba() colors:
   - tokens.background, tokens.surface, tokens.surfaceElevated, tokens.border
   - tokens.textPrimary, tokens.textSecondary, tokens.textMuted
   - tokens.accent, tokens.accentSecondary, tokens.accentSoft, tokens.accentGlow
   - tokens.successColor, tokens.warningColor, tokens.errorColor
   - tokens.isDark (boolean)
5. 'props': Scene runtime properties:
   - props.scene: { id, heading, subtext, visualBrief, narrationScript, accentColor, durationInFrames }
   - props.frame: current animation frame (number)
   - props.fps: 30
   - props.durationInFrames: total scene duration in frames (e.g. 150)
   - props.durationInSeconds: total scene duration in seconds
   - props.width: canvas width (1920 or 1080)
   - props.height: canvas height (1080 or 1920)
   - props.isPortrait: boolean (true when 9:16 portrait)
   - props.language: language code ('en-IN', 'hi-IN', 'gu-IN', 'en-US')
   - props.fontFamily: localized font stack string

### COMPONENT EXPORT CONTRACT
You MUST export the component as the default export of the code snippet:
\`\`\`tsx
export default function GeneratedScene(props) {
  // your implementation
  return (
    <Remotion.AbsoluteFill style={{ ... }}>
      ...
    </Remotion.AbsoluteFill>
  );
}
\`\`\`

### STRICT REMOTION WEB-RENDERER & CHROMIUM PARITY RULES
Exported MP4 videos must match preview perfectly. Violating ANY rule will cause render failure:
1. PURE INLINE STYLES: Use style={{ ... }} exclusively with tokens.#hex or rgba().
   - ZERO Tailwind CSS classes (no 'bg-blue-500', no 'text-xl', etc.).
   - ZERO oklch() colors.
2. NO CONIC GRADIENT: conic-gradient is forbidden. For circular/gauge progress or borders, use inline <svg> with <circle> or <rect> and animated strokeDasharray / strokeDashoffset.
3. NO BACKDROP FILTER: backdropFilter / -webkit-backdrop-filter is forbidden (rasterizes opaque gray).
4. NO FILTER BLUR: filter: "blur(...)" is forbidden. Use layered semi-transparent radial-gradient divs for glows.
5. NO CSS KEYFRAMES: CSS @keyframes and transition are forbidden. Drive ALL motion with Remotion 'frame' using interpolate() or spring().
6. NO 4-ARG BOX-SHADOW: 4-argument box-shadow with spread radius (e.g. '0 0 20px 5px ...') is unsupported. Use 3-arg outer shadows (e.g. '0 12px 32px rgba(0, 0, 0, 0.25)'). ZERO 'inset' shadows.
7. NO 3D TRANSFORMS: perspective, rotateX, rotateY are forbidden. Use 2D transforms (scale, translateY, translateX, rotate).
8. NO CHARACTER SPLITTING: NEVER split text character-by-character (text.split('')) in Hindi or Gujarati (it corrupts Devanagari and Gujarati conjuncts/matras). Split by spaces or keep strings intact.
9. NO IMPORTS OR REQUIRES: Do NOT write 'import ...' or 'const ... = require(...)'. Use the injected 'React', 'Remotion', 'Lucide', 'tokens', and 'props'.
10. NO BROWSER GLOBALS: Do NOT access window, document, localStorage, fetch, or process.

### CANVAS SAFE ZONES & CAPTION CLEARANCE
- Landscape (16:9 1920x1080): padding: 72px 96px 200px 96px. Bottom margin MUST be at least 190px to prevent overlap with Karaoke Captions.
- Portrait (9:16 1080x1920): padding: 100px 64px 300px 64px. Bottom margin MUST be at least 290px for multi-line subtitles.
- Ensure all diagrams, text, and icons stay within the safe bounds.

OUTPUT ONLY THE RAW TSX CODE SNIPPET (NO SURROUNDING MARKDOWN FENCES, NO COMMENTARY).
`;
export const STAGE2_SYSTEM_PROMPT = STAGE_2_SYSTEM_PROMPT;

/**
 * Builds the user prompt for Stage 2 Code Generation from a request.
 */
export function buildStage2Prompt(request: GenerateSceneCodeRequest): string {
  const safeZone = CANVAS_SAFE_ZONES[request.aspectRatio ?? "16:9"];
  const isPortrait = request.aspectRatio === "9:16";

  let prompt = `
Generate a self-contained Remotion TSX Scene component for the following educational video scene:

Topic: "${request.topic}"
Scene Index: ${request.sceneIndex + 1} of ${request.totalScenes}
Heading: "${request.heading}"
${request.subtext ? `Subtext: "${request.subtext}"` : ""}
Visual Brief: "${request.visualBrief}"
Narration Script: "${request.narrationScript}"
Duration: ${request.durationInFrames} frames (${request.durationInSeconds.toFixed(1)}s at 30 fps)
Language: ${request.language}
Theme: ${request.theme} (Accent: ${request.accentColor})
Aspect Ratio: ${request.aspectRatio} (${safeZone.width}x${safeZone.height}, ${isPortrait ? "Portrait" : "Landscape"})

LAYOUT REQUIREMENTS:
- Canvas dimensions: ${safeZone.width} x ${safeZone.height}.
- Safe padding: Top ${safeZone.paddingTop}px, Sides ${safeZone.paddingX}px, Bottom ${safeZone.paddingBottom}px (clearing bottom karaoke captions).
- MANDATORY LONG CODE DENSITY: Write comprehensive, 200-450+ lines of Remotion code with deep SVG vector graphics.
- STRICT ANTI-PPT POLICY: Absolutely NO bullet lists or slide-deck summary cards. Voiceover narrates; the visual screen must be an animated technical/scientific diagram, simulation, or flowchart.
- FULL VERTICAL CANVAS IN PORTRAIT (9:16): If isPortrait is true, make the SVG diagram 900-1100px tall so it fills the 1920px vertical space. Do NOT make a tiny 360px box in the center.
- Responsive: Check props.isPortrait to lay out vertically on 9:16 and horizontally on 16:9.
`;

  if (request.previousError && request.previousCode) {
    prompt += `
\n### PREVIOUS ATTEMPT FAILED WITH COMPILER/RUNTIME ERROR:
Error: ${request.previousError}

Faulty Code:
\`\`\`tsx
${request.previousCode}
\`\`\`

CORRECTION INSTRUCTION:
Fix the syntax/runtime error completely. Adhere strictly to the Remotion Web-Renderer rules (no imports, no window/document, return Scene).
`;
  }

  if (request.userInstruction) {
    prompt += `\nSpecial User Directive: ${request.userInstruction}\n`;
  }

  return prompt.trim();
}

/**
 * Builds a targeted self-correction prompt for Stage 2 when compilation or static AST check fails.
 */
export function buildStage2SelfCorrectionPrompt(
  request: GenerateSceneCodeRequest,
  errorMsg: string,
  faultyCode: string
): string {
  return `
The Remotion TSX code you generated for Scene "${request.heading}" failed validation:

ERROR DETAILS:
${errorMsg}

FAULTY CODE:
\`\`\`tsx
${faultyCode}
\`\`\`

MANDATORY FIX REQUIREMENTS:
1. Resolve the exact error above.
2. Ensure the code contains NO 'import' or 'require' statements.
3. Access all primitives via the injected 'React', 'Remotion', 'Lucide', 'tokens', and 'props'.
4. Do NOT use window, document, fetch, localStorage, or process.
5. End with 'return Scene;' where Scene is your React component function.
6. Return ONLY the corrected TSX code snippet with zero markdown wrappers.
`.trim();
}
