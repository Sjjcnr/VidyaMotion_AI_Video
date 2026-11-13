# VidyaMotion AI - Project Status & Roadmap

## Phase A: Fix Script-Generation 404 and Make Local Testing Work

### Status: COMPLETED & VERIFIED (Commit: `e19ab3f`)

### 1. Root Cause Analysis (Verified with Command Evidence)
- **Root Cause**: When launched via `npm run dev`, Vite only served static frontend files and had no middleware or route handlers mounted for `/api/*`. Any `POST /api/generate-script` request returned an empty `HTTP 404 Not Found`.
- **Vercel vs Vite**: `vercel.json` SPA rewrite rule `/((?!api/).*)` correctly exempts `/api/`, but Vite completely ignores `vercel.json`. `vercel dev` works because Vercel CLI emulates serverless functions, whereas plain Vite did not.
- **Gemini Fallback**: A Gemini 404 (model not found) was NOT the cause of the client 404; the backend already classifies model 404 as `model_unavailable` and advances to the next model in the fallback chain.

### 2. Implementation & Fixes
- **Vite API Dev Middleware (`vite.config.ts`)**:
  - Automatically loads `.env` into `process.env` via `loadEnv(mode, process.cwd(), "")`.
  - Implements `apiDevMiddleware()` plugin (`configureServer` hook) intercepting `POST /api/generate-script` and `POST /api/generate-speech`.
  - Translates Node request streams into standard Web `Request` objects, calls the respective serverless `POST()` handlers, and streams Web `Response` back to the client.
- **Enhanced Model Attempt Reporting (`api/generate-script.ts`)**:
  - Exposes `attempts: error.attemptsSummary` in `ScriptGenerationError` JSON payloads so clients can inspect which models and status codes were attempted (never keys).
- **Specific Error Handling (`src/services/apiClient.ts`)**:
  - Differentiates `API_ROUTE_NOT_FOUND` (404) from `ALL_PROVIDERS_FAILED` (503) and network dropouts (`NETWORK_ERROR`).
  - Formats attempted model chains into human-readable developer feedback without leaking secrets.
- **Documentation (`README.md`)**:
  - Documented local development with both `npm run dev` (Vite + built-in API middleware) and `vercel dev`.

### 3. Verification Evidence
- `npm run typecheck`: Passed (exit 0, 0 errors).
- `npm run build`: Passed (exit 0, built in 2.09s).
- Bundle secret scan: Audited `dist/assets/*.js`; 0 API keys or secret tokens found.
- Live script generation on `npm run dev` (port 5173):
  - `en-IN`: HTTP 200 (5 scenes, `gemini-3.6-flash`, 25.6s)
  - `hi-IN`: HTTP 200 (5 scenes, pure Devanagari script, `gemini-3.6-flash`, 20.1s)
  - `gu-IN`: HTTP 200 (5 scenes, pure Gujarati script, `gemini-3.6-flash`, 19.8s)
- Live script generation on `vercel dev` (port 3001):
  - `en-IN`: HTTP 200 (4 scenes, `gemini-3.6-flash`, 22.0s)
  - 400 validation on empty payload verified.

---

## Phase B1 - B3: AI Code Mode Architecture & Two-Stage Pipeline

### Status: COMPLETED & VERIFIED (Commit: `1745f0a`)

### 1. Architectural Decisions (B1)
- **Compiler**: In-browser `sucrase` (`transforms: ["jsx", "typescript", "imports"]`, `jsxRuntime: "classic"`) transforms LLM-generated TSX into executable JavaScript in < 5ms without needing heavy Babel standalone or WebAssembly compilers.
- **Sandboxing & Remotion Web-Renderer Compatibility**:
  - **Why NOT an iframe**: `@remotion/web-renderer` captures DOM nodes frame-by-frame directly to an HTML canvas context. An iframe isolates documents and triggers canvas tainting or blank exports.
  - **In-Process Sandbox**: Pre-execution AST/regex static analysis forbidding `window.location`, `document.cookie`, `localStorage`, `fetch`, `XMLHttpRequest`, `eval`, `process.env`. Scope injection shadows dangerous globals (`window = undefined`, `document = undefined`). Render tree is wrapped in a React `ErrorBoundary` with graceful placeholder card fallback.
- **Web-Renderer Export Subset**: Strict enforcement of export-compatible styling: pure inline `#hex`/`rgba()` colors, SVG vector elements, standard Flexbox/Grid, and Remotion `spring`/`interpolate` animations. No Tailwind `oklch()`, no `conic-gradient`, no `backdrop-filter`, no CSS `@keyframes`, no 4-argument box shadows.

### 2. Implementation Deliverables (B2 & B3)
- **`PROMPT.md`**: Updated Sections 1, 2.2, 4, and 8 to supersede static template mode with AI Code Mode.
- **Contracts (`src/remotion/types.ts`)**:
  - Added `PlanSceneSchema`, `VideoProjectPlanSchema`, `LLMPlanPayloadSchema` for Stage 1.
  - Added `GeneratedSceneSchema`, `GenerateSceneCodeRequestSchema`, `GenerateSceneCodeResponseSchema` for Stage 2.
  - Updated `SceneSchema` for Code Mode while maintaining backward compatibility for offline presets.
- **Reference Templates (`src/remotion/reference/templates/`)**: Archived 5 static reference scenes (`TitleHeroScene`, `SplitExplainerScene`, `KeyMetricOrFactScene`, `StepByStepFlowScene`, `SummaryTakeawayScene`) with clean relative imports.
- **Design Guide (`src/remotion/reference/sceneDesignGuide.ts`)**:
  - Canvas safe zones (1920x1080 16:9 and 1080x1920 9:16 portrait; 64px side padding, 160px bottom caption clearance).
  - Theme token color maps for 4 themes (`cyber_dark`, `clean_modern`, `sunset_amber`, `emerald_nature`).
  - Stage 2 System Prompt with animation principles and few-shot TSX code exemplars.
- **Backend Generator Engine (`api/_lib/gemini.ts`)**:
  - Implemented Stage 1 `generateScriptWithFallback`: returns `VideoProjectPlan` with rich `visualBrief` entries per scene.
  - Implemented Stage 2 `generateSceneCodeWithFallback`: generates self-contained Remotion TSX components using the full Gemini fallback chain and API keys. Includes self-correction prompt support (`previousError`, `previousCode`) and user regeneration instructions.
- **Endpoints & Middleware (`api/generate-scene-code.ts` & `vite.config.ts`)**:
  - Created `POST /api/generate-scene-code`.
  - Mounted in Vite's `apiDevMiddleware` to serve local dev without Vercel CLI.
- **Client API Client (`src/services/apiClient.ts`)**:
  - Added `generateSceneCode()`.
  - Updated `buildFullVideoProject()` to execute Edge-TTS voiceover synthesis and dynamic Remotion scene coding in parallel.

### 3. Verification Evidence
- `npm run typecheck` (`tsc --noEmit`): PASSED (exit code 0, 0 errors).
- `npm run build` (`tsc --noEmit && vite build`): PASSED (exit code 0, built in 1.78s).
- Secret Scan: Audited all `dist/assets/*.js` chunks; 0 API keys, 0 secrets, 0 `GEMINI_API_KEY` occurrences.
- Dev Server Live Stage 1 Endpoint (`POST /api/generate-script`):
  - Generated 4 scenes with detailed `visualBrief`s (e.g. glowing digital node network, logarithmic O(log n) vs O(n) curve comparison) in 24.0s (`gemini-3.6-flash`).
- Dev Server Live Stage 2 Endpoint (`POST /api/generate-scene-code`):
  - Generated 10,754 characters of clean Remotion TSX code with duration-agnostic `Remotion.spring` and SVG graphics.
  - Empty payload test returned `HTTP 400 Bad Request` with field validation message.

---

## Phase B4 - B6: DynamicSceneRunner, Safety, Reliability & Template Removal

### Status: COMPLETED & VERIFIED (Commit: Phase B4-B6)

### 1. Implementation Deliverables
- **`src/remotion/components/DynamicSceneRunner.tsx`**:
  - **In-Browser Runtime Compilation**: Compiles LLM-generated TSX via `sucrase` inside `useMemo` in < 5ms.
  - **Injected Scope**: Injects React hooks, Remotion primitives (`useCurrentFrame`, `useVideoConfig`, `interpolate`, `spring`, `AbsoluteFill`, `Sequence`), Lucide icon library (`Lucide.*`), theme palette, accentColor, heading, subtext, narrationScript, and frame timing.
  - **Global Shadowing**: Shadows `window`, `document`, `globalThis`, `fetch`, `localStorage`, `sessionStorage` to `undefined`.
  - **Static Security & Loop Validator (`validateSceneCode`)**: Blocks `window.location`, `document.cookie`, `localStorage`, `sessionStorage`, `fetch`, `XMLHttpRequest`, `WebSocket`, `eval`, `process.env`, `while` loops, `do-while` loops, unbounded `for` loops, `setInterval`, `setTimeout`, and `requestAnimationFrame`.
  - **`SceneErrorBoundary`**: React class error boundary wrapping dynamic components. On runtime exception, catches error without unmounting Remotion Player.
  - **`PlaceholderSceneCard`**: Graceful visual card rendered on compile error, security rejection, or runtime exception. Shows scene heading, theme background, and visual brief description; audio and subtitles play uninterrupted.
- **`src/remotion/VideoComposition.tsx`**:
  - Removed template switch and static scene imports (`TitleHeroScene`, `SplitExplainerScene`, etc.).
  - Composition exclusively renders `DynamicSceneRunner` for every scene.
- **`src/components/SceneBreakdownTabs.tsx` & `src/App.tsx`**:
  - Added "View generated code" tab with full TSX code view, character count, and copy functionality.
  - Added per-scene "Regenerate" button with optional instruction input box ("make diagram bigger", etc.).
  - Added scene badges for model (`scene.modelUsed`), correction status (`scene.isCorrected`), and fallback card indicator (`scene.isPlaceholder`).
  - Added visual brief display for each scene card.
  - Updated `PromptPanel.tsx` milestone step 2 to "2. Voice & Code".

### 2. Verification Evidence
- `npm run typecheck` (`tsc --noEmit`): PASSED (exit code 0, 0 errors).
- `npm run build` (`tsc --noEmit && vite build`): PASSED (exit code 0, built in 3.38s).
- **Automated Bad-Code & Safety Tests (`scratch/test-b4-b5.mts`)**:
  - Test 1 (Syntax Error): Caught unclosed JSX tag cleanly (`Unexpected token`).
  - Test 2 (Forbidden APIs): Successfully blocked `fetch()`, `window.location`, `localStorage`, `eval()`.
  - Test 3 (Infinite Loop Guards): Successfully blocked `while(true)`, `do-while`, `setInterval()`.
  - Test 4 (Clean Execution): Successfully compiled and executed valid TSX component in Node without errors.

---

## Next Up: Phase B7 - B9 & Acceptance Testing
- B7: Offline Expo showcase topics regeneration in Code Mode (`src/data/showcasePresets.ts`). Verify offline playback with network off.
- B8: Verification of UI tabs (View code, Regenerate button, Model badges).
- B9: Optional visual self-check inspection.
- Acceptance Tests: 5 topics x 3 languages (`en-IN`, `hi-IN`, `gu-IN`), Bad-code tests, Web-renderer MP4 export in 3 languages, 9:16 portrait export, Secret scan.
