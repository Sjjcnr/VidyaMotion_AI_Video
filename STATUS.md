# VidyaMotion AI - Project Status & Roadmap

## Phase A: Fix Script-Generation 404 and Make Local Testing Work

### Status: COMPLETED & VERIFIED (Commit: Phase A)

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

## Next Up: Phase B1 - B3 (AI Code Mode Architecture & Two-Stage Pipeline)
- B1: Research and decision on runtime TSX/JSX compilation inside `@remotion/player` and `@remotion/web-renderer` DOM sandbox.
- B2: Two-stage pipeline (Stage 1: JSON plan with visual briefs; Stage 2: Parallel duration-agnostic scene code generation).
- B3: Output quality & design guide, moving template scenes to reference folder and using excerpts as few-shot code examples.
- Update `PROMPT.md` (Sections 1, 2.2, 4, 8) to formally supersede template mode.
