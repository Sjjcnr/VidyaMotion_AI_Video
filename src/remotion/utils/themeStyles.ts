import { fitText, fitTextOnNLines } from "@remotion/layout-utils";
import {
  Activity,
  ArrowRight,
  Atom,
  Award,
  BarChart3,
  Binary,
  BookOpen,
  Bot,
  Box,
  Brain,
  Calculator,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleCheck,
  Clock,
  Cloud,
  Code,
  Code2,
  Compass,
  Cpu,
  Database,
  Dna,
  Eye,
  Flame,
  FlaskConical,
  Gauge,
  Globe,
  GraduationCap,
  HardDrive,
  Heart,
  HeartPulse,
  Infinity as InfinityIcon,
  Key,
  Layers,
  Leaf,
  Lightbulb,
  Link,
  Lock,
  Magnet,
  Map as MapIcon,
  Microscope,
  Network,
  Orbit,
  PenTool,
  Percent,
  PieChart,
  Play,
  Plug,
  Radar,
  Recycle,
  RefreshCw,
  Rocket,
  Scale,
  Search,
  Server,
  Settings,
  Shield,
  ShieldCheck,
  Sigma,
  Sliders,
  Smartphone,
  Sparkles,
  Sprout,
  Star,
  Sun,
  Target,
  Terminal,
  Thermometer,
  TrendingUp,
  Triangle,
  Users,
  Waves,
  Wifi,
  Workflow,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { AspectRatio, ThemeId } from "../types";

/**
 * Pure #hex / rgba() palette (ZERO oklch/oklab/color-mix) so @remotion/web-renderer
 * renders identically to @remotion/player.
 */
export interface ThemePalette {
  id: ThemeId;
  name: string;
  isDark: boolean;
  background: string;
  backgroundGradient: string;
  glowPrimary: string;
  glowSecondary: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentSecondary: string;
  accentSoft: string;
  accentGlow: string;
  captionBg: string;
  captionText: string;
  captionHighlightBg: string;
  captionHighlightText: string;
  particleColor: string;
  successColor: string;
}

export const THEME_PALETTES: Record<ThemeId, ThemePalette> = {
  cyber_dark: {
    id: "cyber_dark",
    name: "Cyber Dark",
    isDark: true,
    background: "#020617",
    backgroundGradient: "linear-gradient(135deg, #020617 0%, #0F172A 55%, #082F49 100%)",
    glowPrimary: "rgba(6, 182, 212, 0.32)",
    glowSecondary: "rgba(139, 92, 246, 0.26)",
    surface: "rgba(15, 23, 42, 0.84)",
    surfaceElevated: "rgba(30, 41, 59, 0.9)",
    border: "rgba(56, 189, 248, 0.28)",
    textPrimary: "#F8FAFC",
    textSecondary: "#CBD5E1",
    textMuted: "#94A3B8",
    accent: "#06B6D4",
    accentSecondary: "#8B5CF6",
    accentSoft: "rgba(6, 182, 212, 0.16)",
    accentGlow: "rgba(6, 182, 212, 0.45)",
    captionBg: "rgba(2, 6, 23, 0.86)",
    captionText: "#F8FAFC",
    captionHighlightBg: "#FACC15",
    captionHighlightText: "#0F172A",
    particleColor: "rgba(34, 211, 238, 0.45)",
    successColor: "#10B981",
  },
  clean_modern: {
    id: "clean_modern",
    name: "Clean Modern",
    isDark: false,
    background: "#F8FAFC",
    backgroundGradient: "linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 55%, #E0F2FE 100%)",
    glowPrimary: "rgba(37, 99, 235, 0.16)",
    glowSecondary: "rgba(14, 165, 233, 0.16)",
    surface: "rgba(255, 255, 255, 0.92)",
    surfaceElevated: "rgba(241, 245, 249, 0.96)",
    border: "rgba(37, 99, 235, 0.2)",
    textPrimary: "#0F172A",
    textSecondary: "#334155",
    textMuted: "#64748B",
    accent: "#2563EB",
    accentSecondary: "#0EA5E9",
    accentSoft: "rgba(37, 99, 235, 0.12)",
    accentGlow: "rgba(37, 99, 235, 0.28)",
    captionBg: "rgba(15, 23, 42, 0.88)",
    captionText: "#F8FAFC",
    captionHighlightBg: "#FACC15",
    captionHighlightText: "#0F172A",
    particleColor: "rgba(37, 99, 235, 0.28)",
    successColor: "#059669",
  },
  sunset_amber: {
    id: "sunset_amber",
    name: "Sunset Amber",
    isDark: true,
    background: "#1C0F0A",
    backgroundGradient: "linear-gradient(135deg, #1C0F0A 0%, #2E130F 50%, #431407 100%)",
    glowPrimary: "rgba(245, 158, 11, 0.3)",
    glowSecondary: "rgba(244, 63, 94, 0.24)",
    surface: "rgba(41, 20, 14, 0.86)",
    surfaceElevated: "rgba(67, 29, 18, 0.9)",
    border: "rgba(251, 191, 36, 0.3)",
    textPrimary: "#FFFBEB",
    textSecondary: "#FDE68A",
    textMuted: "#FDBA74",
    accent: "#F59E0B",
    accentSecondary: "#FB7185",
    accentSoft: "rgba(245, 158, 11, 0.18)",
    accentGlow: "rgba(245, 158, 11, 0.42)",
    captionBg: "rgba(28, 15, 10, 0.88)",
    captionText: "#FFFBEB",
    captionHighlightBg: "#FDE047",
    captionHighlightText: "#1C0F0A",
    particleColor: "rgba(251, 191, 36, 0.42)",
    successColor: "#34D399",
  },
  emerald_nature: {
    id: "emerald_nature",
    name: "Emerald Nature",
    isDark: true,
    background: "#022C22",
    backgroundGradient: "linear-gradient(135deg, #021B15 0%, #022C22 52%, #064E3B 100%)",
    glowPrimary: "rgba(16, 185, 129, 0.3)",
    glowSecondary: "rgba(20, 184, 166, 0.25)",
    surface: "rgba(4, 47, 37, 0.86)",
    surfaceElevated: "rgba(6, 78, 59, 0.88)",
    border: "rgba(52, 211, 153, 0.28)",
    textPrimary: "#ECFDF5",
    textSecondary: "#A7F3D0",
    textMuted: "#6EE7B7",
    accent: "#10B981",
    accentSecondary: "#2DD4BF",
    accentSoft: "rgba(16, 185, 129, 0.18)",
    accentGlow: "rgba(16, 185, 129, 0.42)",
    captionBg: "rgba(2, 27, 21, 0.88)",
    captionText: "#ECFDF5",
    captionHighlightBg: "#FACC15",
    captionHighlightText: "#022C22",
    particleColor: "rgba(52, 211, 153, 0.44)",
    successColor: "#34D399",
  },
};

const HEX_COLOR_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function isValidHexColor(color: string | undefined): color is string {
  return typeof color === "string" && HEX_COLOR_RE.test(color.trim());
}

export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.trim().replace("#", "");
  const normalized =
    clean.length === 3
      ? clean
          .split("")
          .map((ch) => ch + ch)
          .join("")
      : clean;
  if (normalized.length !== 6) {
    return `rgba(6, 182, 212, ${alpha})`;
  }
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  const clampedAlpha = Math.max(0, Math.min(1, alpha));
  return `rgba(${r}, ${g}, ${b}, ${clampedAlpha})`;
}

export function getThemePalette(themeId: ThemeId, customAccentColor?: string): ThemePalette {
  const base = THEME_PALETTES[themeId] ?? THEME_PALETTES.cyber_dark;
  if (!isValidHexColor(customAccentColor)) {
    return base;
  }
  const accent = customAccentColor.trim();
  return {
    ...base,
    accent,
    accentSoft: hexToRgba(accent, 0.16),
    accentGlow: hexToRgba(accent, 0.42),
  };
}

export type ExportResolution = "720p" | "1080p";

/**
 * Even canvas dimensions required by H.264 in @remotion/web-renderer.
 * Supports 1080p (Studio Master: 1920x1080 / 1080x1920) and 720p (Fast Export: 1280x720 / 720x1280).
 */
export function getCanvasDimensions(
  aspectRatio: AspectRatio,
  resolution: ExportResolution = "1080p"
): {
  width: number;
  height: number;
} {
  if (resolution === "720p") {
    return aspectRatio === "9:16"
      ? { width: 720, height: 1280 }
      : { width: 1280, height: 720 };
  }
  return aspectRatio === "9:16"
    ? { width: 1080, height: 1920 }
    : { width: 1920, height: 1080 };
}

/**
 * Curated Lucide icon registry (tree-shakable & crash-proof against arbitrary LLM icon strings).
 */
export const LUCIDE_ICON_REGISTRY: Record<string, LucideIcon> = {
  Activity,
  ArrowRight,
  Atom,
  Award,
  BarChart3,
  Binary,
  BookOpen,
  Bot,
  Box,
  Brain,
  Calculator,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleCheck,
  Clock,
  Cloud,
  Code,
  Code2,
  Compass,
  Cpu,
  Database,
  Dna,
  Eye,
  Flame,
  FlaskConical,
  Gauge,
  Globe,
  GraduationCap,
  HardDrive,
  Heart,
  HeartPulse,
  Infinity: InfinityIcon,
  Key,
  Layers,
  Leaf,
  Lightbulb,
  Link,
  Lock,
  Magnet,
  Map: MapIcon,
  Microscope,
  Network,
  Orbit,
  PenTool,
  Percent,
  PieChart,
  Play,
  Plug,
  Radar,
  Recycle,
  RefreshCw,
  Rocket,
  Scale,
  Search,
  Server,
  Settings,
  Shield,
  ShieldCheck,
  Sigma,
  Sliders,
  Smartphone,
  Sparkles,
  Sprout,
  Star,
  Sun,
  Target,
  Terminal,
  Thermometer,
  TrendingUp,
  Triangle,
  Users,
  Waves,
  Wifi,
  Workflow,
  Wrench,
  Zap,
};

const ICON_NORMALIZED_LOOKUP: Map<string, LucideIcon> = (() => {
  const map = new Map<string, LucideIcon>();
  for (const [name, icon] of Object.entries(LUCIDE_ICON_REGISTRY)) {
    map.set(name.toLowerCase(), icon);
  }
  const aliases: Record<string, LucideIcon> = {
    ai: Brain,
    algorithm: Workflow,
    battery: Zap,
    biology: Dna,
    bolt: Zap,
    book: BookOpen,
    bulb: Lightbulb,
    chart: BarChart3,
    chemistry: FlaskConical,
    chip: Cpu,
    circuit: Cpu,
    coding: Code2,
    compute: Cpu,
    data: Database,
    earth: Globe,
    education: GraduationCap,
    electricity: Zap,
    energy: Zap,
    experiment: FlaskConical,
    flask: FlaskConical,
    formula: Sigma,
    gear: Settings,
    graph: TrendingUp,
    growth: TrendingUp,
    heat: Flame,
    idea: Lightbulb,
    lightning: Zap,
    math: Calculator,
    metric: Gauge,
    molecule: Atom,
    nature: Leaf,
    ohm: Zap,
    physics: Atom,
    planet: Globe,
    plant: Sprout,
    power: Zap,
    programming: Terminal,
    rocketlaunch: Rocket,
    science: Microscope,
    security: ShieldCheck,
    solar: Sun,
    space: Orbit,
    speed: Gauge,
    step: ArrowRight,
    steps: Workflow,
    summary: CheckCircle2,
    takeaway: CheckCircle2,
    tree: Network,
    voltage: Zap,
    water: Waves,
    wave: Waves,
    world: Globe,
  };
  for (const [alias, icon] of Object.entries(aliases)) {
    map.set(alias, icon);
  }
  return map;
})();

export function resolveLucideIcon(iconName: string | undefined): LucideIcon {
  if (!iconName || typeof iconName !== "string") {
    return Sparkles;
  }
  const direct = LUCIDE_ICON_REGISTRY[iconName.trim()];
  if (direct) {
    return direct;
  }
  const normalized = iconName.toLowerCase().replace(/[^a-z0-9]/g, "");
  return ICON_NORMALIZED_LOOKUP.get(normalized) ?? Sparkles;
}

const wordSegmenter =
  typeof Intl !== "undefined" && typeof Intl.Segmenter === "function"
    ? new Intl.Segmenter("en", { granularity: "word" })
    : null;

/**
 * Deterministic JS text clamping that preserves Indic (Devanagari/Gujarati) word & grapheme
 * boundaries and appends an explicit ellipsis (since @remotion/web-renderer does not draw CSS line-clamp ellipses).
 */
export function clampText(text: string, maxChars: number): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (maxChars <= 0) {
    return "";
  }
  if (normalized.length <= maxChars) {
    return normalized;
  }

  const limit = Math.max(1, maxChars - 1);
  if (wordSegmenter) {
    let result = "";
    for (const seg of wordSegmenter.segment(normalized)) {
      const next = result + seg.segment;
      if (next.trimEnd().length > limit) {
        break;
      }
      result = next;
    }
    const trimmed = result.trimEnd();
    if (trimmed.length > 0) {
      return `${trimmed}…`;
    }
  }

  const slice = Array.from(normalized).slice(0, limit).join("").trimEnd();
  return `${slice}…`;
}

export interface FitTextWidthOptions {
  text: string;
  withinWidth: number;
  fontFamily: string;
  fontWeight?: number | string;
  maxFontSize: number;
  minFontSize?: number;
}

/**
 * Single-line dynamic font sizing backed by @remotion/layout-utils fitText(),
 * guarded for empty strings and non-browser environments.
 */
export function computeFittedFontSize({
  text,
  withinWidth,
  fontFamily,
  fontWeight = 700,
  maxFontSize,
  minFontSize = 18,
}: FitTextWidthOptions): number {
  const clean = text.trim();
  if (!clean || withinWidth <= 0) {
    return maxFontSize;
  }
  if (typeof document === "undefined") {
    const approxCharWidth = maxFontSize * 0.56;
    const estimated = withinWidth / Math.max(1, clean.length * (approxCharWidth / maxFontSize));
    return Math.max(minFontSize, Math.min(maxFontSize, Math.floor(estimated)));
  }

  try {
    const { fontSize } = fitText({
      text: clean,
      withinWidth,
      fontFamily,
      fontWeight,
      validateFontIsLoaded: false,
    });
    if (!Number.isFinite(fontSize) || fontSize <= 0) {
      return minFontSize;
    }
    return Math.max(minFontSize, Math.min(maxFontSize, Math.floor(fontSize)));
  } catch {
    return Math.max(minFontSize, Math.min(maxFontSize, minFontSize));
  }
}

export interface FitTextBoxOptions {
  text: string;
  maxLines: number;
  maxBoxWidth: number;
  fontFamily: string;
  fontWeight?: number | string;
  maxFontSize: number;
  minFontSize?: number;
}

export interface FitTextBoxResult {
  fontSize: number;
  lines: string[];
}

/**
 * Multi-line dynamic text fitting backed by @remotion/layout-utils fitTextOnNLines(),
 * preserving word integrity across Latin, Devanagari, and Gujarati scripts.
 */
export function computeFittedMultilineText({
  text,
  maxLines,
  maxBoxWidth,
  fontFamily,
  fontWeight = 600,
  maxFontSize,
  minFontSize = 16,
}: FitTextBoxOptions): FitTextBoxResult {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean || maxBoxWidth <= 0 || maxLines <= 0) {
    return { fontSize: maxFontSize, lines: clean ? [clean] : [] };
  }

  if (typeof document === "undefined") {
    return {
      fontSize: Math.max(minFontSize, maxFontSize),
      lines: [clean],
    };
  }

  try {
    const { fontSize, lines } = fitTextOnNLines({
      text: clean,
      maxLines,
      maxBoxWidth,
      fontFamily,
      fontWeight,
      maxFontSize,
      validateFontIsLoaded: false,
    });
    const clampedSize = Number.isFinite(fontSize)
      ? Math.max(minFontSize, Math.min(maxFontSize, Math.floor(fontSize)))
      : minFontSize;
    return {
      fontSize: clampedSize,
      lines: lines.length > 0 ? lines : [clean],
    };
  } catch {
    return {
      fontSize: minFontSize,
      lines: [clean],
    };
  }
}
