# ---- build stage ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# ---- runtime stage ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -S nodegrp && adduser -S nodeusr -G nodegrp

# copy package.json and install only prod deps
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev

# copy app code
COPY --from=builder /app/server.js ./server.js

ARG PORT=3000
ENV PORT=${PORT}
EXPOSE ${PORT}

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- "http://localhost:${PORT}/health" || exit 1

USER nodeusr
CMD ["node", "server.js"]

