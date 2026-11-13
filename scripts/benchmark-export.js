import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

console.log("==================================================================");
console.log("     VIDYAMOTION AI - VIDEO EXPORT BENCHMARK & TEST RUNNER       ");
console.log("==================================================================");

// Find available browser executable
function findBrowser() {
  const candidates = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    process.env.LOCALAPPDATA + "\\Google\\Chrome\\Application\\chrome.exe",
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  throw new Error("No Chrome or Edge browser found on this system.");
}

const BROWSER_PATH = findBrowser();
console.log(`[Setup] Using browser: ${BROWSER_PATH}`);

async function runBenchmark({
  framesToTest = 60, // 2.0 seconds of video (fast and statistically representative)
  presetId = "binary-search-trees",
  port = 9444,
} = {}) {
  const userDataDir = path.resolve(process.cwd(), "scratch", "bench-profile");
  if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true });
  }

  console.log(`[Setup] Spawning headless browser on port ${port}...`);
  const browserProc = spawn(BROWSER_PATH, [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    "--headless=new",
    "--no-first-run",
    "--no-default-browser-check",
    // Enable hardware acceleration and WebCodecs
    "--enable-features=WebCodecs,CanvasOopRasterization",
    "http://localhost:5173",
  ]);

  browserProc.on("error", (err) => {
    console.error("Failed to spawn browser:", err);
  });

  // Give the browser 3 seconds to launch
  await new Promise((r) => setTimeout(r, 3000));

  try {
    const listRes = await fetch(`http://localhost:${port}/json`);
    const pages = await listRes.json();
    const targetPage = pages.find((p) => p.url.includes("localhost:5173")) || pages[0];
    if (!targetPage || !targetPage.webSocketDebuggerUrl) {
      throw new Error("No WebSocket debugger URL found.");
    }

    const ws = new WebSocket(targetPage.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let msgId = 1;
    const sendCDP = (method, params = {}) => {
      const id = msgId++;
      return new Promise((resolve, reject) => {
        const handler = (event) => {
          const data = JSON.parse(event.data);
          if (data.id === id) {
            ws.removeEventListener("message", handler);
            if (data.error) reject(data.error);
            else resolve(data.result);
          }
        };
        ws.addEventListener("message", handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    };

    await sendCDP("Page.enable");
    await sendCDP("Runtime.enable");

    // Forward browser console logs
    ws.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      if (data.method === "Runtime.consoleAPICalled") {
        const text = data.params.args.map((a) => a.value || a.description || "").join(" ");
        if (data.params.type === "error") {
          console.error(`  [Browser Console Error]: ${text}`);
        } else if (text.includes("Remotion") || text.includes("export")) {
          console.log(`  [Browser Console]: ${text}`);
        }
      }
    });

    // Wait for window.__vidyamotion
    console.log("[Setup] Waiting for React application to mount...");
    let ready = false;
    for (let i = 0; i < 30; i++) {
      const evalRes = await sendCDP("Runtime.evaluate", {
        expression: "typeof window.__vidyamotion !== 'undefined' && !!window.__vidyamotion.currentProject",
        returnByValue: true,
      });
      if (evalRes?.result?.value === true) {
        ready = true;
        break;
      }
      await new Promise((r) => setTimeout(r, 500));
    }

    if (!ready) {
      throw new Error("Application failed to mount on http://localhost:5173");
    }
    console.log("✓ Application mounted and ready.");

    // Load test preset
    await sendCDP("Runtime.evaluate", {
      expression: `window.__vidyamotion.loadPreset('${presetId}')`,
      returnByValue: true,
    });
    await new Promise((r) => setTimeout(r, 1000));

    console.log(`\n[Benchmark] Target Test Clip: ${framesToTest} frames (${(framesToTest / 30).toFixed(1)}s video at 30 fps)\n`);

    // Define test configurations to compare
    const testConfigs = [
      {
        name: "1080p Studio Master (default responsiveness)",
        resolution: "1080p",
        scale: 1,
        pageResponsiveness: "medium",
        hardwareAcceleration: "no-preference",
      },
      {
        name: "720p Fast Export (scale: 2/3, default responsiveness)",
        resolution: "720p",
        scale: 2 / 3,
        pageResponsiveness: "medium",
        hardwareAcceleration: "no-preference",
      },
      {
        name: "720p Fast Export (scale: 2/3, unthrottled)",
        resolution: "720p",
        scale: 2 / 3,
        pageResponsiveness: "disabled",
        hardwareAcceleration: "no-preference",
      },
      {
        name: "720p Native Canvas (1280x720, unthrottled)",
        resolution: "720p-native",
        scale: 1,
        native720p: true,
        pageResponsiveness: "disabled",
        hardwareAcceleration: "no-preference",
      },
      {
        name: "1080p Studio Master (unthrottled)",
        resolution: "1080p",
        scale: 1,
        pageResponsiveness: "disabled",
        hardwareAcceleration: "no-preference",
      },
    ];

    const results = [];

    for (const config of testConfigs) {
      console.log(`>>> Running Benchmark: ${config.name}...`);

      const benchResult = await sendCDP("Runtime.evaluate", {
        expression: `(async () => {
          try {
            const project = window.__vidyamotion.currentProject;
            const res = await window.__vidyamotion.runExportBenchmark(project, {
              frames: ${framesToTest},
              resolution: "${config.resolution === "720p-native" ? "720p" : config.resolution}",
              hardwareAcceleration: "${config.hardwareAcceleration}",
              pageResponsiveness: "${config.pageResponsiveness}",
              nativeDimensions: ${config.native720p ? "true" : "false"}
            });
            return {
              success: true,
              elapsedMs: res.elapsedMs,
              blobSize: res.blobSizeBytes,
              framesRendered: res.frames,
            };
          } catch (err) {
            return {
              success: false,
              error: String(err && (err.stack || err.message) ? (err.stack || err.message) : err),
            };
          }
        })()`,
        awaitPromise: true,
        returnByValue: true,
      });

      if (benchResult.exceptionDetails) {
        console.error("  CDP Exception Details:", JSON.stringify(benchResult.exceptionDetails));
      }

      const res = benchResult.result?.value || { success: false, error: JSON.stringify(benchResult) };
      if (!res.success) {
        console.error(`  ✕ FAILED: ${res.error}`);
        results.push({
          config: config.name,
          success: false,
          error: res.error,
        });
      } else {
        const elapsedSec = res.elapsedMs / 1000;
        const msPerFrame = res.elapsedMs / res.framesRendered;
        const renderFps = res.framesRendered / elapsedSec;
        const speedRatio = renderFps / 30; // >1 means faster than real-time playback
        const sizeMb = (res.blobSize / (1024 * 1024)).toFixed(2);

        console.log(`  ✓ Completed in ${elapsedSec.toFixed(2)}s | ${msPerFrame.toFixed(1)}ms/frame | ${renderFps.toFixed(1)} FPS (${speedRatio.toFixed(2)}x real-time) | ${sizeMb} MB`);

        results.push({
          config: config.name,
          resolution: config.resolution,
          success: true,
          elapsedSec,
          msPerFrame,
          renderFps,
          speedRatio,
          sizeMb,
        });
      }

      // Small pause between runs to cool down CPU/GPU
      await new Promise((r) => setTimeout(r, 1000));
    }

    ws.close();

    // Print Comparison Report Table
    console.log("\n==================================================================");
    console.log("                     BENCHMARK COMPARISON REPORT                  ");
    console.log("==================================================================");
    console.table(
      results.map((r) => {
        if (!r.success) {
          return {
            Configuration: r.config,
            Status: "FAILED",
            "Total Time (s)": "N/A",
            "ms / Frame": "N/A",
            "Render FPS": "N/A",
            "vs 1080p": "N/A",
          };
        }
        const baselineTime = results[0]?.elapsedSec || r.elapsedSec;
        const speedup = ((baselineTime / r.elapsedSec - 1) * 100).toFixed(1);
        const speedupStr =
          r === results[0]
            ? "1.0x (Baseline)"
            : `${(baselineTime / r.elapsedSec).toFixed(2)}x (${speedup >= 0 ? "+" : ""}${speedup}%)`;

        return {
          Configuration: r.config,
          "Total Time (s)": `${r.elapsedSec.toFixed(2)}s`,
          "ms / Frame": `${r.msPerFrame.toFixed(1)}ms`,
          "Render FPS": `${r.renderFps.toFixed(1)} fps`,
          "Speed Ratio": `${r.speedRatio.toFixed(2)}x realtime`,
          "Output Size": `${r.sizeMb} MB`,
          "vs 1080p Baseline": speedupStr,
        };
      })
    );

    // Save JSON output
    const reportPath = path.resolve(process.cwd(), "scratch", "export-benchmark-results.json");
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), "utf8");
    console.log(`\nResults saved to: ${reportPath}`);

    return results;
  } finally {
    browserProc.kill();
    console.log("\n[Cleanup] Headless browser closed.");
  }
}

runBenchmark().catch((err) => {
  console.error("Benchmark failed with error:", err);
  process.exit(1);
});
