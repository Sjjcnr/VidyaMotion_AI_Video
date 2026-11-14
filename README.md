# 🎬 VidyaMotion AI — Topic-to-Animated-Video Studio

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Runtime: Node.js 24](https://img.shields.io/badge/Runtime-Node.js%2024.x-brightgreen.svg)](https://nodejs.org)
[![Framework: React 19](https://img.shields.io/badge/Frontend-React%2019.3.1-61dafb.svg)](https://react.dev)
[![Engine: Remotion 4](https://img.shields.io/badge/Video%20Engine-Remotion%204.0.542-purple.svg)](https://remotion.dev)
[![Bundler: Vite 8](https://img.shields.io/badge/Bundler-Vite%208.3.8-646cff.svg)](https://vitejs.dev)
[![Styling: Tailwind CSS v4](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38bdf8.svg)](https://tailwindcss.com)
[![Deployment: Vercel + Azure](https://img.shields.io/badge/Cloud-Vercel%20%2B%20Azure%20Container%20Apps-0078d4.svg)](https://azure.microsoft.com)

> Autonomous Topic-to-Animated-Video Studio for STEM and educational concepts in **Indian English**, **Hindi (Devanagari)**, and **Gujarati**.  
> Features dynamic Remotion AI Code Mode generation via Google Gemini, Microsoft Edge-TTS neural narration with word-level karaoke subtitles, client-side WebCodecs export, and an optional parallel headless Chromium render worker on Azure Container Apps.

---

## 🏗️ System Architecture

VidyaMotion AI uses a **two-tier hybrid rendering architecture**:
1. **Tier 1 (Client & Serverless Generation):** Vercel handles frontend hosting, UI interactivity, client-side WebCodecs video rendering, and serverless generation endpoints (`/api/*.ts`).
2. **Tier 2 (Cloud Parallel Render Worker):** An optional dedicated Node.js/Chromium container running on Azure Container Apps (ACA) capable of scaling down to 0 replicas to minimize idle costs while providing multi-core parallel video encoding.

### ASCII Architecture Diagram

```
+---------------------------------------------------------------------------------------+
|                                    CLIENT BROWSER                                     |
|  React 19 + Vite 8 SPA                                                                |
|  - PromptPanel (Topic, Theme, Language, Aspect Ratio)                                 |
|  - VideoPreviewPanel (@remotion/player with custom frame-scrubber transport)          |
|  - SceneBreakdownTabs (Scene timeline, Monaco-style TSX viewer, per-scene regenerator)|
|  - DynamicSceneRunner (In-browser Sucrase TSX sandbox + SceneErrorBoundary)           |
+------------------------------------------+--------------------------------------------+
                    |                      |
       (1) Generation Requests             | (4b) Optional Cloud Render
        POST /api/generate-script          |      POST /api/render
        POST /api/generate-scene-code      |      (if VITE_RENDER_API_URL set)
        POST /api/generate-speech          |
                    v                      v
+-----------------------------------+   +-----------------------------------------------+
|  TIER 1: VERCEL SERVERLESS        |   |  TIER 2: AZURE CONTAINER APPS WORKER          |
|  Node.js 24 Runtime (max 90s)     |   |  Docker: node:24-bookworm-slim (Port 8080)    |
|                                   |   |  - 2.0 vCPU | 4.1 GB RAM | Scale: 0 to 3      |
|  - /api/generate-script:          |   |  - Remotion Bundler & Headless Chromium       |
|    Gemini Structured Output Plan  |   |  - Multi-process parallel frame rendering     |
|    (3-6 scenes with visualBrief)  |   |  - Streams output.mp4 directly to client      |
|  - /api/generate-scene-code:      |   |  - GET /health                                |
|    Gemini Code Mode (TSX string)  |   |  - POST /api/render                           |
|  - /api/generate-speech:          |   +-----------------------------------------------+
|    Edge-TTS WebSocket client      |
|    (Base64 MP3 + 100ns tick sync) |
+-----------------------------------+
                    |
                    v
    (4a) Default In-Browser Export
         @remotion/web-renderer
         (Client WebCodecs H.264/AAC MP4)
```

### End-to-End Sequence Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as User Browser
    participant API as Vercel Serverless (/api)
    participant Gemini as Google Gemini API
    participant EdgeTTS as Microsoft Edge-TTS
    participant ACA as Azure Container App

    User->>API: POST /api/generate-script (topic, lang, theme)
    API->>Gemini: Generate Structured Plan (JSON Schema)
    Gemini-->>API: 3-6 Scenes (heading, narration, visualBrief)
    API-->>User: VideoProjectPlan

    par Parallel Generation per Scene
        User->>API: POST /api/generate-speech (narration text)
        API->>EdgeTTS: WebSocket synthesize audio
        EdgeTTS-->>API: MP3 stream + word boundaries
        API-->>User: data:audio/mpeg;base64 + CaptionWord[]
    and
        User->>API: POST /api/generate-scene-code (scene spec)
        API->>Gemini: Generate Remotion TSX code (200-450+ lines)
        Gemini-->>API: Raw TSX Code string
        API-->>User: Validated Scene Code
    end

    User->>User: Transpile TSX via Sucrase & Mount Remotion Composition

    alt Cloud Export (VITE_RENDER_API_URL configured)
        User->>ACA: POST /api/render { project, resolution }
        Note over ACA: Wakes from 0 replicas, bundles entry.ts,<br/>renders frames in parallel with Headless Chromium
        ACA-->>User: Stream binary video/mp4 (Content-Disposition: attachment)
    else Browser Export (Default Fallback)
        User->>User: renderMediaOnWeb() using WebCodecs (Client-side MP4 blob)
    end
```

---

## 🔬 Reality Check & Limitations

> [!IMPORTANT]
> **Code Reality & Grounded Constraints:**
> - **Zero-Buzzword Guarantee:** VidyaMotion AI is a functional, code-grounded TypeScript project. It does **not** employ opaque proprietary video models like Sora or Runway. Instead, it uses Gemini to write deterministic Remotion React/TSX animation code executed inside a browser/Chromium container.
> - **Cloud Worker Cold Starts:** When deployed on Azure Container Apps with `--min-replicas 0` (to maintain zero idle cost), cold starts take **~40–46 seconds** for the first request while ACA provisions the container. The client must allow at least a 60-second HTTP timeout.
> - **Absence of Job Queue:** The ACA `render-service` executes incoming renders synchronously via `renderMedia()`. It has **no Redis or BullMQ task queue**. Concurrent render requests on a 4 GB RAM container will execute in parallel and may cause container out-of-memory errors under heavy concurrent load.
> - **Gemini Rate Limits:** Free/PayGo Gemini Flash models enforce a 15 Requests Per Minute (RPM) quota. Generating a 5-scene video requires 6 API calls (1 script call + 5 parallel scene code calls). Rapid consecutive generations may trigger `HTTP 429 Quota Exhausted`. A 6-model fallback chain (`gemini-3.8-flash` down to `gemma-4-31b-it`) and multi-key rotation are implemented to mitigate this.
> - **Browser WebCodecs Memory Ceiling:** Client-side export runs in-memory via `@remotion/web-renderer`. Video projects longer than ~3 minutes (>5,400 frames at 1080p) risk browser tab termination on client machines with ≤8 GB RAM.
> - **No Web Speech Fallback:** Speech synthesis relies on Edge-TTS via serverless WebSocket. Web Speech API emulation is not implemented in the codebase.
> - **Static Scene Exemplars:** Files in `src/remotion/scenes/` are reference templates. All active composition rendering is dynamically executed by `DynamicSceneRunner.tsx`.

---

## ⚡ Verified Feature Matrix

| Feature | Implementation Mechanism | Status | Notes |
| :--- | :--- | :---: | :--- |
| **Topic-to-Script Planning** | Gemini Structured JSON Output (`/api/generate-script`) | ✅ Verified | Returns 3–6 scenes with narration, heading, and visualBrief. |
| **AI Remotion Code Generation** | Gemini TSX Code Mode (`/api/generate-scene-code`) | ✅ Verified | Generates 200–450+ lines of raw Remotion TSX per scene. |
| **In-Browser TSX Sandbox** | Sucrase (`classic` JSX + TS) in `DynamicSceneRunner.tsx` | ✅ Verified | Static AST/regex security check blocks DOM/storage escapes. |
| **Neural Narration** | Edge-TTS WebSocket client (`/api/generate-speech`) | ✅ Verified | `en-IN`, `hi-IN`, `gu-IN` neural voices with base64 output. |
| **Karaoke Subtitles** | `@remotion/captions` + Edge-TTS 100ns tick boundaries | ✅ Verified | Highlight pill active word alignment; fallback `Intl.Segmenter`. |
| **Offline Showcase Presets** | Pre-bundled MP3s & metadata in `src/data/showcasePresets.ts` | ✅ Verified | 4 complete STEM lessons playable with zero internet connection. |
| **Bundled Offline Fonts** | Local `.woff2` files under `public/fonts/` | ✅ Verified | Inter, Noto Sans Devanagari, Noto Sans Gujarati. |
| **In-Browser Video Export** | `@remotion/web-renderer` via WebCodecs | ✅ Verified | 1080p & 720p client MP4 export; ~7 FPS unthrottled. |
| **Cloud Parallel Rendering** | Node 24 + Express + Remotion on Azure Container Apps | ✅ Verified | Tested at 23.06 FPS (28s video rendered in 36.4s on 2 vCPUs). |

---

## 🚀 Quickstart & Prerequisites

### Prerequisites
- **Node.js:** `24.x` (or `>= 22.x`)
- **npm:** `>= 10.x`
- **Docker:** (Optional, only required if building the ACA `render-service` container locally)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Sjjcnr/VidyaMotion_AI_Video.git
cd VidyaMotion_AI_Video
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` and provide your Google Gemini API key:
```env
# Primary Gemini API Key (Server-side only; NEVER prefix with VITE_)
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Key failover rotation
GEMINI_API_KEY_BACKUP_1=
GEMINI_API_KEY_BACKUP_2=

# Optional: Cloud Render Worker URL (Leave blank for in-browser export)
# VITE_RENDER_API_URL=https://your-container-app.region.azurecontainerapps.io
```

### 3. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173).  
The integrated Vite middleware (`apiDevMiddleware()` in `vite.config.ts`) executes all serverless API endpoints natively in Node.js with your `.env` variables loaded. No external CLI required.

---

## ⚙️ Configuration Matrix & Security Bindings

| Environment Variable | Context | Default Value | Description / Security Boundary |
| :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | Server-Side Only | *Required* | Primary Google AI Studio API key. Never exposed to browser. |
| `GEMINI_API_KEY_BACKUP_1` | Server-Side Only | *Optional* | Secondary failover key on HTTP 429 quota exhaustion. |
| `GEMINI_API_KEY_BACKUP_2` | Server-Side Only | *Optional* | Tertiary failover key. |
| `GEMINI_MODELS` | Server-Side Only | `gemini-3.8-flash,gemini-3.6-flash,...` | Comma-delimited Gemini fallback model sequence. |
| `TTS_PROXY_URL` | Server-Side Only | *Optional* | HTTP/HTTPS proxy URL for Edge-TTS in restricted networks. |
| `VITE_RENDER_API_URL` | Client & Build | *Undefined* | Injected at build time. When set, delegates exports to ACA worker. |
| `PORT` | Container Only | `8080` | Port for ACA Express server. Listens on `0.0.0.0:8080`. |

---

## 📡 Tested API Specifications & Code Examples

### 1. `POST /api/generate-script`
Generates a structured video production plan from a topic.

**Request:**
```bash
curl -X POST http://localhost:5173/api/generate-script \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Photosynthesis in plants",
    "language": "en-IN",
    "theme": "emerald_nature",
    "aspectRatio": "16:9"
  }'
```

**Response (`200 OK`):**
```json
{
  "plan": {
    "id": "proj-1731600000000",
    "topic": "Photosynthesis in plants",
    "language": "en-IN",
    "theme": "emerald_nature",
    "aspectRatio": "16:9",
    "fps": 30,
    "scenes": [
      {
        "id": "scene-1",
        "heading": "Harnessing the Sun",
        "subtext": "How green plants convert solar energy into chemical food",
        "narrationScript": "Plants act as natural solar factories, trapping light through chlorophyll.",
        "visualBrief": "Full-screen sun rays radiating into green chloroplast cell cross-section.",
        "accentColor": "#10B981"
      }
    ]
  },
  "modelUsed": "gemini-3.8-flash",
  "fallbackUsed": false
}
```

---

### 2. `POST /api/generate-speech`
Synthesizes speech with millisecond word timestamps using Edge-TTS.

**Request:**
```bash
curl -X POST http://localhost:5173/api/generate-speech \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Plants act as natural solar factories.",
    "language": "en-IN",
    "voice": "en-IN-NeerjaNeural"
  }'
```

**Response (`200 OK`):**
```json
{
  "audioDataUrl": "data:audio/mpeg;base64,//uQZAAAAAAAAAAAAAAAA...",
  "durationInSeconds": 2.45,
  "durationInFrames": 88,
  "captions": [
    { "text": "Plants", "startMs": 120, "endMs": 520 },
    { "text": "act", "startMs": 540, "endMs": 760 },
    { "text": "as", "startMs": 780, "endMs": 910 },
    { "text": "natural", "startMs": 930, "endMs": 1380 },
    { "text": "solar", "startMs": 1400, "endMs": 1820 },
    { "text": "factories.", "startMs": 1840, "endMs": 2400 }
  ]
}
```

---

### 3. `POST /api/render` (Azure Container Apps Engine)
Renders a full Remotion project into an MP4 video file on the cloud worker.

**Request:**
```bash
curl -X POST https://<your-container-app>.azurecontainerapps.io/api/render \
  -H "Content-Type: application/json" \
  -d '{
    "resolution": "720p",
    "project": {
      "id": "demo-render",
      "topic": "Binary Search Trees",
      "language": "en-IN",
      "theme": "cyber_dark",
      "aspectRatio": "16:9",
      "fps": 30,
      "scenes": [
        {
          "id": "scene-1",
          "heading": "Binary Search Trees",
          "subtext": "Hierarchical Data Structures",
          "narrationScript": "A binary search tree organizes data for logarithmic search.",
          "accentColor": "#06B6D4",
          "durationInFrames": 60,
          "code": "const { AbsoluteFill } = Remotion; return (<AbsoluteFill style={{background: \"#0f172a\", color: \"#38bdf8\", display: \"flex\", alignItems: \"center\", justifyContent: \"center\"}}><h1>Binary Search Trees</h1></AbsoluteFill>);"
        }
      ]
    }
  }' \
  --output video.mp4
```

**Response Headers (`200 OK`):**
```http
Content-Type: video/mp4
Content-Disposition: attachment; filename="demo-render-720p.mp4"
Content-Length: 1625292
X-Render-Time-Ms: 36419
X-Render-Fps: 23.06
```

---

## 🐳 Azure Container Apps Deployment Guide

To deploy the dedicated rendering engine to Azure Container Apps:

```bash
# 1. Sign in to Azure CLI
az login

# 2. Create Resource Group & Azure Container Registry (ACR)
az group create --name vidyamotion-rg --location eastasia
az acr create --resource-group vidyamotion-rg --name <your-acr-name> --sku Basic --admin-enabled true

# 3. Build & push Docker image
docker build -t <your-acr-name>.azurecr.io/vidyamotion-render:v1 .
az acr login --name <your-acr-name>
docker push <your-acr-name>.azurecr.io/vidyamotion-render:v1

# 4. Create Container Apps Environment
az containerapp env create \
  --name vidyamotion-render-env \
  --resource-group vidyamotion-rg \
  --location eastasia

# 5. Deploy Container App with Scale-to-Zero (Saves 100% idle cost)
az containerapp create \
  --name vidyamotion-render \
  --resource-group vidyamotion-rg \
  --environment vidyamotion-render-env \
  --image <your-acr-name>.azurecr.io/vidyamotion-render:v1 \
  --target-port 8080 \
  --ingress external \
  --cpu 2.0 \
  --memory 4.0Gi \
  --min-replicas 0 \
  --max-replicas 3 \
  --registry-server <your-acr-name>.azurecr.io
```

---

## ❓ Troubleshooting FAQ

### 1. `HTTP 503 ALL_PROVIDERS_FAILED` during script generation
- **Cause:** Upstream Gemini API rate limiting (HTTP 429) or invalid API keys.
- **Remedy:** Ensure `GEMINI_API_KEY` is active. Provide backup keys in `GEMINI_API_KEY_BACKUP_1` or verify your current quota in Google AI Studio.

### 2. `ConnectTimeoutError` on the first Cloud Render request
- **Cause:** The Azure Container App is scaling up from 0 replicas (cold start takes ~40–46s).
- **Remedy:** Increase your HTTP client timeout to >= 60 seconds. Once the container is warm, subsequent renders process immediately.

### 3. Client Export crashes browser tab
- **Cause:** Video length exceeds 3 minutes, causing browser WebCodecs memory exhaustion.
- **Remedy:** Switch the resolution switch from `1080p` to `720p` in the preview panel (reduces pixel processing by 55.6%), or configure `VITE_RENDER_API_URL` to offload rendering to Azure.

### 4. Edge-TTS fails with WebSocket Error in Cloud Environments
- **Cause:** Cloud datacenter egress IP ranges (e.g. AWS or GCP) are occasionally blocked by Microsoft Edge-TTS endpoints.
- **Remedy:** Set the `TTS_PROXY_URL` environment variable in your `.env` pointing to a residential or forwarding proxy.

---

## 📜 Legal & Ethical Disclaimer

This repository is licensed under the [MIT License](LICENSE).  
- **Voiceover Services:** Microsoft Edge-TTS is an unauthenticated client endpoint. Ensure compliance with Microsoft's terms of service when utilizing TTS for commercial redistribution.
- **AI-Generated Code:** Code generated by Google Gemini is executed in an isolated client-side sandbox. The developers assume no liability for content generated by third-party LLMs.
