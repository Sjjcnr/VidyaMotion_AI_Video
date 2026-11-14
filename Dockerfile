FROM node:24-bookworm-slim

# Install system dependencies for Chromium, FFMPEG, and fonts
RUN apt-get update && apt-get install -y \
  ffmpeg \
  chromium \
  fonts-freefont-ttf \
  fonts-liberation \
  libnss3 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libdrm2 \
  libxkbcommon0 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libgbm1 \
  libasound2 \
  libpango-1.0-0 \
  libcairo2 \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    REMOTION_CHROMIUM_PATH=/usr/bin/chromium \
    NODE_ENV=production \
    PORT=8080

WORKDIR /app

# Copy isolated render-service dependencies (keeps Vercel root package.json untouched)
COPY render-service/package.json ./

# Install render engine dependencies
RUN npm install --omit=dev

# Copy application source code and Remotion compositions
COPY tsconfig.json* ./
COPY src ./src
COPY public ./public
COPY render-service/server.mjs ./server.mjs
COPY render-service/entry.ts ./entry.ts

EXPOSE 8080

CMD ["node", "server.mjs"]
