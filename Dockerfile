# portfolios — trimind-portfolios (Next.js 15, React 19, Clerk, Convex)
# Built into the image. To apply host edits: `docker compose up -d --build portfolios`.
# NOTE: requires a real .env.local (Clerk + Convex) in the project root for `next build`.
FROM node:20-bookworm-slim

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
