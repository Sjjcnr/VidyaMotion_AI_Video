import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'vidyamotion-render-engine',
    cpus: os.cpus().length,
    memoryGb: (os.totalmem() / 1024 / 1024 / 1024).toFixed(1),
    uptime: Math.round(process.uptime()),
  });
});

let cachedBundle = null;
let bundlingPromise = null;

async function getOrCreateBundle() {
  if (cachedBundle) {
    return cachedBundle;
  }
  if (bundlingPromise) {
    return bundlingPromise;
  }

  bundlingPromise = (async () => {
    console.log('📦 Bundling Remotion composition from src/remotion/Root.tsx...');
    const start = Date.now();
    cachedBundle = await bundle({
      entryPoint: path.resolve('./src/remotion/Root.tsx'),
    });
    console.log(`✅ Remotion bundled in ${((Date.now() - start) / 1000).toFixed(1)}s at ${cachedBundle}`);
    return cachedBundle;
  })();

  return bundlingPromise;
}

app.post('/api/render', async (req, res) => {
  const startTime = Date.now();
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vidyamotion-render-'));
  const outputPath = path.join(tempDir, 'output.mp4');

  try {
    const { project, resolution = '1080p' } = req.body;
    if (!project || !Array.isArray(project.scenes) || project.scenes.length === 0) {
      return res.status(400).json({ error: 'Missing valid project payload with scenes' });
    }

    const serveUrl = await getOrCreateBundle();
    const is720p = resolution === '720p';

    const composition = await selectComposition({
      serveUrl,
      id: 'VidyaMotionVideo',
      inputProps: { project },
    });

    const cpuCount = os.cpus().length;
    const concurrency = Math.max(2, Math.min(cpuCount, 8));

    console.log(`🎬 Rendering ${composition.durationInFrames} frames at ${resolution} with concurrency ${concurrency}...`);

    await renderMedia({
      composition,
      serveUrl,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps: { project },
      concurrency,
      scale: is720p ? 2 / 3 : 1,
      chromiumOptions: {
        enableMultiProcessOnLinux: true,
      },
    });

    const elapsedMs = Date.now() - startTime;
    const stats = fs.statSync(outputPath);
    console.log(`✅ Render finished in ${(elapsedMs / 1000).toFixed(1)}s (${(composition.durationInFrames / (elapsedMs / 1000)).toFixed(1)} FPS). Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="${project.id || 'vidyamotion'}-${resolution}.mp4"`);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('X-Render-Time-Ms', elapsedMs.toString());
    res.setHeader('X-Render-Fps', (composition.durationInFrames / (elapsedMs / 1000)).toFixed(2));

    const fileStream = fs.createReadStream(outputPath);
    fileStream.pipe(res);
    fileStream.on('close', () => {
      fs.rm(tempDir, { recursive: true, force: true }, () => {});
    });
  } catch (err) {
    console.error('❌ Render error:', err);
    fs.rm(tempDir, { recursive: true, force: true }, () => {});
    res.status(500).json({ error: err.message || 'Render failed' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 VidyaMotion Render Server running on port ${PORT}`);
  getOrCreateBundle().catch((e) => console.warn('Background bundle notice:', e.message));
});
