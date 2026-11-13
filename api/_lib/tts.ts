import type { Agent } from "node:http";
import { HttpsProxyAgent } from "https-proxy-agent";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { parseBuffer } from "music-metadata";
import {
  GenerateSpeechResponseSchema,
  LanguageCodeSchema,
  type CaptionWord,
  type GenerateSpeechResponse,
  type LanguageCode,
} from "../../src/remotion/types.ts";

export const DEFAULT_VOICE_BY_LANGUAGE: Record<LanguageCode, string> = {
  "en-IN": "en-IN-NeerjaNeural",
  "hi-IN": "hi-IN-SwaraNeural",
  "gu-IN": "gu-IN-DhwaniNeural",
  "en-US": "en-US-JennyNeural",
};

export const ALLOWED_VOICES: ReadonlySet<string> = new Set([
  "en-IN-NeerjaNeural",
  "en-IN-PrabhatNeural",
  "hi-IN-SwaraNeural",
  "hi-IN-MadhurNeural",
  "gu-IN-DhwaniNeural",
  "gu-IN-NiranjanNeural",
  "en-US-JennyNeural",
  "en-US-GuyNeural",
  "en-US-AriaNeural",
]);

const VIDEO_FPS = 30;
const MIN_SCENE_FRAMES = 90;
const PADDING_FRAMES = 15;
const MAX_TEXT_LENGTH = 3000;
const CONNECTION_TIMEOUT_MS = 10_000;
const SYNTHESIS_TIMEOUT_MS = 25_000;
const MAX_TRANSIENT_RETRIES = 1;
const RETRY_DELAY_MS = 350;
const TICKS_PER_MILLISECOND = 10_000;

export interface SynthesizeSpeechInput {
  text: string;
  language?: LanguageCode;
  voice?: string;
}

export class TtsError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly retryable: boolean;

  constructor(
    message: string,
    code: string,
    statusCode = 502,
    retryable = false,
    options?: { cause?: unknown }
  ) {
    super(message, options);
    this.name = "TtsError";
    this.code = code;
    this.statusCode = statusCode;
    this.retryable = retryable;
  }
}

interface RawMetadataItem {
  Type?: unknown;
  Data?: {
    Offset?: unknown;
    Duration?: unknown;
    text?: {
      Text?: unknown;
    };
  };
}

interface RawWordBoundary {
  text: string;
  startMs: number;
  rawEndMs: number;
  order: number;
}

/**
 * Resolves the Edge-TTS neural voice name from an optional allowlisted override
 * or falls back to the default voice for the requested language.
 */
export function resolveVoice(
  language: LanguageCode,
  requestedVoice?: string
): string {
  const trimmed = requestedVoice?.trim();
  if (!trimmed) {
    return DEFAULT_VOICE_BY_LANGUAGE[language];
  }
  if (!ALLOWED_VOICES.has(trimmed)) {
    throw new TtsError(
      `Unsupported voice "${trimmed}". Allowed voices: ${Array.from(ALLOWED_VOICES).join(", ")}.`,
      "INVALID_VOICE",
      400,
      false
    );
  }
  return trimmed;
}

/**
 * Strips XML-disallowed control characters and escapes `< > & " '` so narration
 * text injected into MsEdgeTTS's SSML template never breaks XML parsing.
 */
export function sanitizeTextForSsml(rawText: string): string {
  const cleaned = rawText
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return "";
  }

  return cleaned
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Unescapes XML entities returned inside Edge-TTS WordBoundary metadata so
 * captions render clean characters (`&`, `'`, `"`, `<`, `>`) instead of `&amp;`.
 */
export function unescapeXmlEntities(value: string): string {
  return value.replace(
    /&(#x[0-9a-fA-F]+|#\d+|amp|lt|gt|quot|apos);/g,
    (match, entity: string) => {
      switch (entity) {
        case "amp":
          return "&";
        case "lt":
          return "<";
        case "gt":
          return ">";
        case "quot":
          return '"';
        case "apos":
          return "'";
        default: {
          const isHex = entity.startsWith("#x") || entity.startsWith("#X");
          const codePoint = isHex
            ? Number.parseInt(entity.slice(2), 16)
            : Number.parseInt(entity.slice(1), 10);
          if (
            Number.isInteger(codePoint) &&
            codePoint >= 0 &&
            codePoint <= 0x10ffff
          ) {
            return String.fromCodePoint(codePoint);
          }
          return match;
        }
      }
    }
  );
}

function createProxyAgent(): Agent | undefined {
  const proxyUrl = process.env.TTS_PROXY_URL?.trim();
  if (!proxyUrl) {
    return undefined;
  }

  let parsed: URL;
  try {
    parsed = new URL(proxyUrl);
  } catch {
    throw new TtsError(
      "TTS_PROXY_URL is not a valid URL.",
      "INVALID_PROXY_URL",
      502,
      false
    );
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new TtsError(
      "TTS_PROXY_URL must use http: or https: protocol.",
      "INVALID_PROXY_URL",
      502,
      false
    );
  }

  return new HttpsProxyAgent(proxyUrl);
}

/**
 * Extracts one or more top-level JSON objects from a metadata stream buffer,
 * handling both standard single-JSON chunks and coalesced JSON objects.
 */
function parseMetadataObjects(rawChunk: string): unknown[] {
  const trimmed = rawChunk.trim();
  if (!trimmed) {
    return [];
  }

  try {
    return [JSON.parse(trimmed)];
  } catch {
    const results: unknown[] = [];
    let depth = 0;
    let inString = false;
    let escaped = false;
    let start = -1;

    for (let i = 0; i < trimmed.length; i++) {
      const ch = trimmed[i];

      if (inString) {
        if (escaped) {
          escaped = false;
        } else if (ch === "\\") {
          escaped = true;
        } else if (ch === '"') {
          inString = false;
        }
        continue;
      }

      if (ch === '"') {
        inString = true;
        continue;
      }

      if (ch === "{") {
        if (depth === 0) {
          start = i;
        }
        depth++;
      } else if (ch === "}" && depth > 0) {
        depth--;
        if (depth === 0 && start !== -1) {
          const slice = trimmed.slice(start, i + 1);
          try {
            results.push(JSON.parse(slice));
          } catch {
            // Ignore malformed fragment and continue scanning remaining payloads.
          }
          start = -1;
        }
      }
    }

    return results;
  }
}

function extractWordBoundaries(
  metadataPayloads: readonly unknown[]
): CaptionWord[] {
  const rawWords: RawWordBoundary[] = [];
  let order = 0;

  for (const payload of metadataPayloads) {
    if (
      typeof payload !== "object" ||
      payload === null ||
      !("Metadata" in payload) ||
      !Array.isArray((payload as { Metadata?: unknown }).Metadata)
    ) {
      continue;
    }

    const items = (payload as { Metadata: RawMetadataItem[] }).Metadata;
    for (const item of items) {
      if (item?.Type !== "WordBoundary" || !item.Data) {
        continue;
      }

      const offset = item.Data.Offset;
      const duration = item.Data.Duration;
      const rawText = item.Data.text?.Text;

      if (
        typeof rawText !== "string" ||
        typeof offset !== "number" ||
        !Number.isFinite(offset) ||
        typeof duration !== "number" ||
        !Number.isFinite(duration)
      ) {
        continue;
      }

      const cleanText = unescapeXmlEntities(rawText).replace(/\s+/g, " ").trim();
      if (!cleanText) {
        continue;
      }

      const startMs = Math.max(0, Math.round(offset / TICKS_PER_MILLISECOND));
      const rawEndMs = Math.max(
        startMs,
        Math.round((offset + Math.max(0, duration)) / TICKS_PER_MILLISECOND)
      );

      rawWords.push({
        text: cleanText,
        startMs,
        rawEndMs,
        order: order++,
      });
    }
  }

  rawWords.sort(
    (a, b) =>
      a.startMs - b.startMs || a.rawEndMs - b.rawEndMs || a.order - b.order
  );

  const captions: CaptionWord[] = [];
  let prevStartMs = 0;

  for (const entry of rawWords) {
    const startMs = Math.max(0, prevStartMs, entry.startMs);
    const endMs = Math.max(startMs + 1, entry.rawEndMs);
    captions.push({
      text: entry.text,
      startMs,
      endMs,
    });
    prevStartMs = startMs;
  }

  return captions;
}

function isRetryableError(error: unknown): boolean {
  if (error instanceof TtsError) {
    return error.retryable;
  }

  const message = error instanceof Error ? error.message : String(error);
  return /WebSocket|timed out|403|429|5\d\d|ECONNRESET|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|ECONNREFUSED|closed before|No audio data|truncated/i.test(
    message
  );
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function synthesizeOnce(
  sanitizedText: string,
  voice: string,
  agent: Agent | undefined
): Promise<GenerateSpeechResponse> {
  const tts = new MsEdgeTTS({
    ...(agent ? { agent } : {}),
    connectionTimeoutMs: CONNECTION_TIMEOUT_MS,
    synthesisTimeoutMs: SYNTHESIS_TIMEOUT_MS,
  });

  try {
    await tts.setMetadata(
      voice,
      OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3,
      { wordBoundaryEnabled: true }
    );

    const { audioStream, metadataStream } = tts.toStream(sanitizedText);

    const audioChunks: Buffer[] = [];
    const metadataPayloads: unknown[] = [];

    try {
      await Promise.all([
        new Promise<void>((resolve, reject) => {
          let settled = false;
          let ended = false;

          const finish = (err?: Error) => {
            if (settled) return;
            settled = true;
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          };

          audioStream.on("data", (chunk: Buffer | Uint8Array | string) => {
            audioChunks.push(
              Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
            );
          });

          audioStream.once("end", () => {
            ended = true;
            finish();
          });

          audioStream.once("close", () => {
            if (!ended) {
              finish(
                new TtsError(
                  "Edge-TTS audio stream closed before completion.",
                  "TTS_STREAM_TRUNCATED",
                  502,
                  true
                )
              );
            }
          });

          audioStream.once("error", (err: Error) => {
            finish(
              new TtsError(
                `Edge-TTS audio stream error: ${err.message}`,
                "TTS_STREAM_ERROR",
                502,
                true,
                { cause: err }
              )
            );
          });
        }),
        new Promise<void>((resolve, reject) => {
          if (!metadataStream) {
            resolve();
            return;
          }

          let settled = false;
          const finish = (err?: Error) => {
            if (settled) return;
            settled = true;
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          };

          metadataStream.on("data", (chunk: Buffer | Uint8Array | string) => {
            const text =
              typeof chunk === "string"
                ? chunk
                : Buffer.from(chunk).toString("utf8");
            metadataPayloads.push(...parseMetadataObjects(text));
          });

          metadataStream.once("close", () => {
            finish();
          });

          // Safety net if audioStream closes without triggering metadataStream close.
          audioStream.once("close", () => {
            setImmediate(() => finish());
          });

          metadataStream.once("error", (err: Error) => {
            finish(
              new TtsError(
                `Edge-TTS metadata stream error: ${err.message}`,
                "TTS_METADATA_ERROR",
                502,
                true,
                { cause: err }
              )
            );
          });
        }),
      ]);
    } catch (error) {
      audioStream.destroy();
      metadataStream?.destroy();
      throw error;
    }

    const audioBuffer = Buffer.concat(audioChunks);
    if (audioBuffer.length === 0) {
      throw new TtsError(
        "Edge-TTS returned an empty audio buffer.",
        "TTS_EMPTY_AUDIO",
        502,
        true
      );
    }

    const parsedMetadata = await parseBuffer(
      audioBuffer,
      { mimeType: "audio/mpeg", size: audioBuffer.byteLength },
      { duration: true }
    );

    const durationInSeconds = parsedMetadata.format.duration;
    if (
      typeof durationInSeconds !== "number" ||
      !Number.isFinite(durationInSeconds) ||
      durationInSeconds <= 0
    ) {
      throw new TtsError(
        "Could not determine exact MP3 duration from synthesized audio.",
        "TTS_DURATION_ERROR",
        502,
        true
      );
    }

    const durationInFrames = Math.max(
      MIN_SCENE_FRAMES,
      Math.ceil(durationInSeconds * VIDEO_FPS) + PADDING_FRAMES
    );
    const captions = extractWordBoundaries(metadataPayloads);
    const audioDataUrl = `data:audio/mpeg;base64,${audioBuffer.toString("base64")}`;

    return GenerateSpeechResponseSchema.parse({
      audioDataUrl,
      durationInSeconds,
      durationInFrames,
      captions,
    });
  } finally {
    try {
      tts.close();
    } catch {
      // Ignore socket close errors during cleanup.
    }
  }
}

/**
 * Synthesizes speech with Microsoft Edge-TTS (`msedge-tts@2.1.1`), extracts
 * WordBoundary karaoke timings (100ns ticks -> ms), measures exact MP3 duration
 * via `music-metadata`, and computes `durationInFrames` at 30 FPS (+15 pad, min 90).
 */
export async function synthesizeSpeech(
  input: SynthesizeSpeechInput
): Promise<GenerateSpeechResponse> {
  const languageResult = LanguageCodeSchema.safeParse(
    input.language ?? "en-IN"
  );
  if (!languageResult.success) {
    throw new TtsError(
      `Unsupported language "${String(input.language)}".`,
      "INVALID_LANGUAGE",
      400,
      false
    );
  }
  const language = languageResult.data;

  if (typeof input.text !== "string") {
    throw new TtsError("Narration text must be a string.", "INVALID_TEXT", 400, false);
  }

  const trimmedInput = input.text.trim();
  if (!trimmedInput) {
    throw new TtsError("Narration text cannot be empty.", "EMPTY_TEXT", 400, false);
  }
  if (trimmedInput.length > MAX_TEXT_LENGTH) {
    throw new TtsError(
      `Narration text exceeds maximum length of ${MAX_TEXT_LENGTH} characters.`,
      "TEXT_TOO_LONG",
      400,
      false
    );
  }

  const sanitizedText = sanitizeTextForSsml(trimmedInput);
  if (!sanitizedText) {
    throw new TtsError(
      "Narration text contains no speakable characters.",
      "EMPTY_TEXT",
      400,
      false
    );
  }

  const voice = resolveVoice(language, input.voice);
  const agent = createProxyAgent();

  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_TRANSIENT_RETRIES; attempt++) {
    try {
      return await synthesizeOnce(sanitizedText, voice, agent);
    } catch (error) {
      lastError = error;
      if (attempt < MAX_TRANSIENT_RETRIES && isRetryableError(error)) {
        await delay(RETRY_DELAY_MS * (attempt + 1));
        continue;
      }
      break;
    }
  }

  if (lastError instanceof TtsError) {
    throw lastError;
  }

  const message =
    lastError instanceof Error ? lastError.message : "Unknown Edge-TTS error.";
  throw new TtsError(
    `Edge-TTS synthesis failed: ${message}`,
    "TTS_SYNTHESIS_FAILED",
    502,
    false,
    { cause: lastError }
  );
}
