import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * Lightweight Vite dev server plugin that mounts /api/generate-script,
 * /api/generate-speech, and /api/generate-scene-code as local Web Standard endpoints in development mode.
 * Eliminates 404s when running "npm run dev" without requiring Vercel CLI.
 */
function apiDevMiddleware(): Plugin {
  return {
    name: "api-dev-middleware",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const rawUrl = req.url ?? "";
        const pathname = rawUrl.split("?")[0];

        if (
          req.method === "POST" &&
          (pathname === "/api/generate-script" ||
            pathname === "/api/generate-speech" ||
            pathname === "/api/generate-scene-code")
        ) {
          try {
            const chunks: Uint8Array[] = [];
            for await (const chunk of req) {
              chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
            }
            const bodyBuffer = Buffer.concat(chunks);

            const host = req.headers.host || "localhost:5173";
            const protocol =
              req.socket && "encrypted" in req.socket && req.socket.encrypted
                ? "https"
                : "http";
            const fullUrl = `${protocol}://${host}${rawUrl}`;

            const headers = new Headers();
            for (const [key, value] of Object.entries(req.headers)) {
              if (value !== undefined) {
                if (Array.isArray(value)) {
                  for (const v of value) headers.append(key, v);
                } else {
                  headers.set(key, value);
                }
              }
            }

            const webRequest = new Request(fullUrl, {
              method: "POST",
              headers,
              body: bodyBuffer.length > 0 ? bodyBuffer : undefined,
              // @ts-expect-error duplex is a valid Node RequestInit option
              duplex: "half",
            });

            let webResponse: Response;
            if (pathname === "/api/generate-script") {
              const { POST: handleGenerateScript } = await import(
                "./api/generate-script.ts"
              );
              webResponse = await handleGenerateScript(webRequest);
            } else if (pathname === "/api/generate-speech") {
              const { POST: handleGenerateSpeech } = await import(
                "./api/generate-speech.ts"
              );
              webResponse = await handleGenerateSpeech(webRequest);
            } else if (pathname === "/api/generate-scene-code") {
              const { POST: handleGenerateSceneCode } = await import(
                "./api/generate-scene-code.ts"
              );
              webResponse = await handleGenerateSceneCode(webRequest);
            } else {
              next();
              return;
            }

            res.statusCode = webResponse.status;
            webResponse.headers.forEach((val, key) => {
              res.setHeader(key, val);
            });

            const arrayBuffer = await webResponse.arrayBuffer();
            res.end(Buffer.from(arrayBuffer));
          } catch (err) {
            console.error(`[vite-api-dev] Error handling ${pathname}:`, err);
            if (!res.headersSent) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(
                JSON.stringify({
                  error: "Internal dev server API error",
                  code: "DEV_SERVER_API_ERROR",
                  details: err instanceof Error ? err.message : String(err),
                })
              );
            } else {
              res.end();
            }
          }
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Load environment variables (GEMINI_API_KEY, GEMINI_MODELS, TTS_PROXY_URL)
  // and merge them into process.env so local API handlers can access them under `npm run dev`.
  const env = loadEnv(mode, process.cwd(), "");
  Object.assign(process.env, env);

  return {
    plugins: [react(), tailwindcss(), apiDevMiddleware()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  };
});
