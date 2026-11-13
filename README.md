# 🎬 VidyaMotion AI — Topic-to-Animated-Video Studio

> Autonomous Topic-to-Animated-Video Generation Studio for STEM and educational concepts in **Indian English**, **Hindi (Devanagari)**, and **Gujarati**.  
> Powered by Dynamic Remotion AI Code Mode, Edge-TTS Neural Voiceover, and In-Browser WebCodecs Video Export.

---

## ⚡ Core Architecture

- **Frontend:** React 19 + TypeScript + Vite 8 + Tailwind CSS v4 + Lucide Icons + Framer Motion.
- **Video Player:** Remotion 4.x (`@remotion/player`) for instant in-browser playback.
- **In-Browser Video Export:** Remotion client-side WebCodecs renderer (`@remotion/web-renderer`) producing downloadable 1080p MP4 videos entirely in the user's browser with **zero server-side FFmpeg or Chromium**.
- **AI Code Mode Engine:** Google Gemini API (`@google/genai` v1beta) generates custom, duration-agnostic Remotion TSX code per scene, executing in an isolated in-browser Sucrase sandbox. Includes an automatic 6-model priority fallback chain (`gemini-3.8-flash` → `gemini-3.6-flash` → `gemini-3-flash-preview` → `gemini-3.5-flash-lite` → `gemini-3.1-flash-lite` → `gemma-4-31b-it`).
- **Voiceover & Subtitles:** Microsoft Edge-TTS neural Indian voices (`en-IN-NeerjaNeural`, `hi-IN-SwaraNeural`, `gu-IN-DhwaniNeural`) with word-boundary timestamps feeding TikTok/Reels-style karaoke subtitles (`@remotion/captions`).
- **Featured Offline Demos:** 4 pre-rendered STEM topics bundled with local MP3s and offline fonts (`Inter`, `Noto Sans Devanagari`, `Noto Sans Gujarati`) for instant zero-latency playback without an internet connection.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js:** `24.x` (or `22.x+`)
- **npm:** `10+`

### 2. Environment Variables
Create a `.env` file in the project root based on [`.env.example`](file:///c:/Users/91638/OneDrive/Desktop/Antigravity/Topic2video/.env.example):

```bash
# Primary Gemini API Key (Server-side only; NEVER prefix with VITE_)
GEMINI_API_KEY=your_gemini_api_key_here

# Optional backup keys for automatic quota failover
GEMINI_API_KEY_BACKUP_1=
GEMINI_API_KEY_BACKUP_2=

# Ordered Gemini fallback chain
GEMINI_MODELS=gemini-3.8-flash,gemini-3.6-flash,gemini-3-flash-preview,gemini-3.5-flash-lite,gemini-3.1-flash-lite,gemma-4-31b-it

# Optional proxy URL for Edge-TTS in cloud datacenter environments
TTS_PROXY_URL=
```

### 3. Local Development

You can run the application locally using either of two workflows:

#### Option A: Vite Dev Server (Recommended for Fast Local Development)
```bash
npm run dev
```
- Starts Vite on `http://localhost:5173`.
- **Built-in API Middleware:** The Vite development server automatically intercepts `POST /api/generate-script` and `POST /api/generate-speech` using your local `.env` variables and executes the serverless handlers natively in Node.js. No 404 errors!

#### Option B: Vercel Local Emulator
```bash
vercel dev
```
- Emulates the full Vercel serverless functions runtime and SPA routing locally on `http://localhost:3000`.

---

## 🛠️ Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Vite dev server with integrated API endpoints |
| `npm run build` | Runs strict TypeScript checks (`tsc --noEmit`) and builds for production (`vite build`) |
| `npm run typecheck` | Type-checks both `src/` and `api/` with strict TypeScript 7 settings |
| `npm run preview` | Previews the production build locally from `dist/` |

---

## 📱 Featured Demos Offline Mode

When running in environments with unreliable connectivity, click the **"Featured Demos"** button in the top navigation bar to load any of the 4 pre-rendered showcase compositions:
1. **Binary Search Trees** (`en-IN` / Clean Modern)
2. **प्रकाश संश्लेषण (Photosynthesis)** (`hi-IN` / Emerald Nature)
3. **How Rocket Engines Work** (`en-IN` / Sunset Amber)
4. **ઓહ્મનો નિયમ (Ohm's Law)** (`gu-IN` / Clean Modern)

Showcase presets bundle pre-synthesized audio in `/public/demos/` and load bundled offline `.woff2` fonts, guaranteeing instant playback and video export even without an internet connection.

---

## ☁️ Deployment (Vercel)

The project is configured as a single repository deploying both the Vite frontend and the serverless API routes (`/api/*.ts`):

```bash
# 1. Sign in to Vercel
vercel login

# 2. Link repository
vercel link

# 3. Add environment variables
vercel env add GEMINI_API_KEY production
vercel env add GEMINI_MODELS production

# 4. Deploy production build
vercel --prod
```
