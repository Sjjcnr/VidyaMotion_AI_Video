import {
  createTikTokStyleCaptions,
  type Caption,
  type TikTokPage,
} from "@remotion/captions";
import type { CaptionWord } from "../types";

export type { Caption, TikTokPage, TikTokToken } from "@remotion/captions";

/**
 * Converts our compact CaptionWord[] into @remotion/captions Caption[] format,
 * ensuring space-prefixed tokens after index 0 so createTikTokStyleCaptions()
 * can paginate cleanly and preserve word spacing across English, Hindi, and Gujarati.
 */
export function toRemotionCaptions(words: readonly CaptionWord[]): Caption[] {
  return words
    .filter((w) => w.text.trim().length > 0)
    .map((word, index) => {
      const startMs = Math.max(0, Math.round(word.startMs));
      const endMs = Math.max(startMs + 40, Math.round(word.endMs));
      const cleanText = word.text.trim();
      const spacedText =
        index === 0
          ? cleanText
          : word.text.startsWith(" ")
            ? word.text
            : ` ${cleanText}`;

      return {
        text: spacedText,
        startMs,
        endMs,
        timestampMs: startMs,
        confidence: null,
      };
    });
}

export interface BuildCaptionPagesOptions {
  words: readonly CaptionWord[];
  combineTokensWithinMilliseconds?: number;
  breakOnSilenceAfterMilliseconds?: number;
}

/**
 * Generates paginated TikTok/Reels-style caption pages from CaptionWord[]
 * using @remotion/captions createTikTokStyleCaptions().
 */
export function buildTikTokCaptionPages({
  words,
  combineTokensWithinMilliseconds = 1400,
  breakOnSilenceAfterMilliseconds = 450,
}: BuildCaptionPagesOptions): TikTokPage[] {
  if (words.length === 0) {
    return [];
  }

  const captions = toRemotionCaptions(words);
  if (captions.length === 0) {
    return [];
  }

  const { pages } = createTikTokStyleCaptions({
    captions,
    combineTokensWithinMilliseconds,
    breakOnSilenceAfterMilliseconds,
  });

  return pages;
}

/**
 * Returns the active TikTokPage at the given scene-relative playback time in milliseconds.
 */
export function getActiveCaptionPage(
  pages: readonly TikTokPage[],
  currentTimeMs: number
): TikTokPage | null {
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const nextPage = pages[i + 1];
    const pageEndMs = nextPage
      ? Math.max(page.startMs + page.durationMs, nextPage.startMs)
      : page.startMs + page.durationMs;

    if (currentTimeMs >= page.startMs && currentTimeMs <= pageEndMs) {
      return page;
    }
  }
  return null;
}

const wordSegmenter =
  typeof Intl !== "undefined" && typeof Intl.Segmenter === "function"
    ? new Intl.Segmenter("en", { granularity: "word" })
    : null;

/**
 * Generates evenly distributed word-level CaptionWord[] timings when pre-computed
 * WordBoundary metadata is unavailable (preserving Indic word/matra integrity).
 */
export function buildEstimatedCaptionsFromScript(
  narrationScript: string,
  durationInSeconds: number
): CaptionWord[] {
  const clean = narrationScript.replace(/\s+/g, " ").trim();
  if (!clean || durationInSeconds <= 0) {
    return [];
  }

  const words = wordSegmenter
    ? Array.from(wordSegmenter.segment(clean))
        .filter((s) => s.isWordLike || s.segment.trim().length > 0)
        .map((s) => s.segment.trim())
        .filter((w) => w.length > 0)
    : clean.split(/\s+/).filter((w) => w.length > 0);

  if (words.length === 0) {
    return [];
  }

  const totalMs = Math.max(300, Math.round(durationInSeconds * 1000) - 250);
  const stepMs = totalMs / words.length;

  return words.map((text, index) => {
    const startMs = Math.round(index * stepMs);
    const endMs = Math.round((index + 1) * stepMs);
    return {
      text,
      startMs,
      endMs: Math.max(startMs + 50, endMs),
    };
  });
}
