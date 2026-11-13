import { loadFont, type LoadFontOptions } from "@remotion/fonts";
import { useEffect, useState } from "react";
import { cancelRender, continueRender, delayRender, useDelayRender } from "remotion";
import type { LanguageCode } from "./types";

export const FONT_FAMILY_INTER = "Inter";
export const FONT_FAMILY_DEVANAGARI = "Noto Sans Devanagari";
export const FONT_FAMILY_GUJARATI = "Noto Sans Gujarati";

const DEVANAGARI_UNICODE_RANGE =
  "U+0900-097F,U+1CD0-1CF9,U+200C-200D,U+20A8,U+20B9,U+20F0,U+25CC,U+A830-A839,U+A8E0-A8FF,U+11B00-11B09";

const GUJARATI_UNICODE_RANGE =
  "U+0951-0952,U+0964-0965,U+0A80-0AFF,U+200C-200D,U+20B9,U+25CC,U+A830-A839";

interface BundledFontSpec extends Omit<LoadFontOptions, "url"> {
  fileName: string;
}

const BUNDLED_FONTS: readonly BundledFontSpec[] = [
  {
    family: FONT_FAMILY_INTER,
    fileName: "inter-400.woff2",
    weight: "400",
    style: "normal",
    format: "woff2",
  },
  {
    family: FONT_FAMILY_INTER,
    fileName: "inter-500.woff2",
    weight: "500",
    style: "normal",
    format: "woff2",
  },
  {
    family: FONT_FAMILY_INTER,
    fileName: "inter-600.woff2",
    weight: "600",
    style: "normal",
    format: "woff2",
  },
  {
    family: FONT_FAMILY_INTER,
    fileName: "inter-700.woff2",
    weight: "700",
    style: "normal",
    format: "woff2",
  },
  {
    family: FONT_FAMILY_INTER,
    fileName: "inter-800.woff2",
    weight: "800",
    style: "normal",
    format: "woff2",
  },
  {
    family: FONT_FAMILY_DEVANAGARI,
    fileName: "noto-sans-devanagari-400.woff2",
    weight: "400",
    style: "normal",
    format: "woff2",
    unicodeRange: DEVANAGARI_UNICODE_RANGE,
  },
  {
    family: FONT_FAMILY_DEVANAGARI,
    fileName: "noto-sans-devanagari-600.woff2",
    weight: "600",
    style: "normal",
    format: "woff2",
    unicodeRange: DEVANAGARI_UNICODE_RANGE,
  },
  {
    family: FONT_FAMILY_DEVANAGARI,
    fileName: "noto-sans-devanagari-700.woff2",
    weight: "700",
    style: "normal",
    format: "woff2",
    unicodeRange: DEVANAGARI_UNICODE_RANGE,
  },
  {
    family: FONT_FAMILY_GUJARATI,
    fileName: "noto-sans-gujarati-400.woff2",
    weight: "400",
    style: "normal",
    format: "woff2",
    unicodeRange: GUJARATI_UNICODE_RANGE,
  },
  {
    family: FONT_FAMILY_GUJARATI,
    fileName: "noto-sans-gujarati-600.woff2",
    weight: "600",
    style: "normal",
    format: "woff2",
    unicodeRange: GUJARATI_UNICODE_RANGE,
  },
  {
    family: FONT_FAMILY_GUJARATI,
    fileName: "noto-sans-gujarati-700.woff2",
    weight: "700",
    style: "normal",
    format: "woff2",
    unicodeRange: GUJARATI_UNICODE_RANGE,
  },
];

function resolveFontUrl(fileName: string): string {
  const env = (import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env;
  const rawBase = env?.BASE_URL ?? "/";
  const base = rawBase.endsWith("/") ? rawBase : `${rawBase}/`;
  return `${base}fonts/${fileName}`;
}

let fontsPromise: Promise<void> | null = null;
let fontsLoaded = false;

/**
 * Loads all bundled offline .woff2 fonts into document.fonts and Remotion's font registry.
 * Safe to call multiple times (returns the same singleton promise).
 */
export function loadProjectFonts(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }
  if (fontsPromise) {
    return fontsPromise;
  }

  const handle = delayRender("Loading bundled offline project fonts");

  fontsPromise = Promise.all(
    BUNDLED_FONTS.map(({ fileName, ...options }) =>
      loadFont({
        ...options,
        url: resolveFontUrl(fileName),
        display: "block",
      })
    )
  )
    .then(async () => {
      if (typeof document !== "undefined" && document.fonts) {
        await document.fonts.ready;
      }
      fontsLoaded = true;
      continueRender(handle);
    })
    .catch((err) => {
      fontsPromise = null;
      cancelRender(err);
      throw err;
    });

  return fontsPromise;
}

/**
 * React hook for Remotion compositions / Root.tsx to block frame-0 render
 * inside both @remotion/player and @remotion/web-renderer until offline fonts are ready.
 */
export function useProjectFonts(): boolean {
  const [ready, setReady] = useState<boolean>(fontsLoaded);
  const { delayRender: delayScopedRender, continueRender: continueScopedRender, cancelRender: cancelScopedRender } =
    useDelayRender();

  useEffect(() => {
    if (fontsLoaded) {
      setReady(true);
      return;
    }

    let cancelled = false;
    const handle = delayScopedRender("Waiting for bundled offline fonts");

    loadProjectFonts()
      .then(() => {
        if (!cancelled) {
          setReady(true);
        }
        continueScopedRender(handle);
      })
      .catch((err) => {
        cancelScopedRender(err);
      });

    return () => {
      cancelled = true;
    };
  }, [cancelScopedRender, continueScopedRender, delayScopedRender]);

  return ready;
}

/**
 * Returns a CSS fontFamily stack with the language's primary script font first
 * so both DOM and @remotion/web-renderer canvas measureText() metrics match.
 */
export function getFontFamilyForLanguage(language: LanguageCode | string): string {
  switch (language) {
    case "hi-IN":
      return `"${FONT_FAMILY_DEVANAGARI}", "${FONT_FAMILY_INTER}", sans-serif`;
    case "gu-IN":
      return `"${FONT_FAMILY_GUJARATI}", "${FONT_FAMILY_INTER}", sans-serif`;
    case "en-IN":
    case "en-US":
    default:
      return `"${FONT_FAMILY_INTER}", sans-serif`;
  }
}
